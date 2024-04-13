
export default (k) => {
    return {
        /**
         * Initializes the tiledImporter
         * @param {string | JSON} map Pass the file path of the json file to load from or the json data itself.
         * @param {Array<string> | JSON | null} tilesets Pass an array of file paths pointing to the tilesets data or the tilesets data itself, pass nothing or null to use tilesets, built in to the map.
         * @returns {TiledImporter} A class that contains all map data provided as well as some functions for accessing that data and implementing it to the game.
         */
        importTiledMap(map, tilesets){
            return new TiledImporter(map, tilesets, k);
        }
    };
}

class TiledImporter {
    constructor(map, tilesets, k){
        this.map = map;
        this.tilesets = tilesets;
        this.layerTypes = {
            TILE_LAYER: 1,
            OBJECT_LAYER: 2,
        };
        this.k = k;
    }
    /**
     * Loads the map. Uses Promises to handle loading so use it with async/await or with callbacks.
     */
    async loadMap(){
        let resp = await fetch(this.map);
        let data = await resp.json();
        this.map = data;
    }
    /**
     * Loads the tilesets. Call this function even if you want to use the built in tilesets. Uses Promises to handle loading so use it with async/await or with callbacks.
     */
    async loadTilesets(){
        if (this.tilesets == null) {
            this.tilesets = this.map.tilesets;
        } else if (Array.isArray(this.tilesets) == true) {
            let tilesetsData = []
            for (let tileset of this.tilesets) {
                let resp = await fetch(tileset);
                let data = await resp.json();
                tilesetsData.push(data);
            }
            this.tilesets = tilesetsData;
        }
    }

    /**
     * Retrieves layers of the map as a simple array-object structure.
     * @returns {Array<Object>} An array of objects, each referencing a layer, have two fields for name and type.
     */
    getLayers(){
        let layers = [];
        let index = 0;
        for (let layer of this.map.layers) {
            let layerData = {};
            if (layer.name != "" || !layer.name) {
                layerData.name = layer.name;
                if (layer.type == "objectgroup") {
                    layerData.type = this.layerTypes.OBJECT_LAYER;
                } else if (layer.type == "tilelayer") {
                    layerData.type = this.layerTypes.TILE_LAYER;
                } else {
                    index += 1;
                    continue;
                }
                layers[index] = layerData;
            }
            index += 1;
        }
        return layers;
    }
    /**
     * Retrieves the index of a layer on the map by its name.
     * @param {string} name Name of the layer.
     * @param {TiledImporter.layerTypes | null} type Type of the layer, optional.
     * @returns {number} Index of the layer in map. Will be used to referance it in other methods.
     */
    getLayerIndex(name, type){
        let index = 0;
        for (let layer of this.getLayers()) {
            if ((!type && layer.name == name) || (layer.type == type && layer.name == name)) {
                return index;
            }
            index += 1;
        }
        this.k.debug.error("No layer with this name and/or with type was found.");
    }

    /**
     * Retrieves tileset names as an array of strings.
     * @returns {Array<string>} A list of tileset names.
     */
    getTilesetNames(){
        let tilesets = []
        for (let set of this.tilesets) {
            tilesets.push(set.name);
        }
        return tilesets;
    }

    /**
     * Retrieves the index of the tileset from its name.
     * @param {string} name Name of the tileset
     * @returns {number} The index in the tilesets array. Will be used to referance it in other methods.
     */
    getTilesetIndex(name){
        let index = 0;
        for (let set of this.getTilesetNames()) {
            if (set == name) {
                return index;
            }
            index += 1;
        }
        this.k.debug.error("No tileset with this name was found.");
    }

    /**
     * Adds a tile layer to the kaboom game.
     * @param {number} layerIndex Index of the layer in the map, use getLayerIndex to retrieve it from name.
     * @param {string} sourceImage The name used to import image to Kaboom.
     * @param {number} tilesetIndex Index of the tileset. Use getTilesetIndex function to retrieve it from name.
     * @param {GameObj<any> | null} gameObject The game object to implement the layer to. If not specified, a new one will be created.
     * @returns {GameObj<any>} A game object which the layer is implemented to.
     */
    addTileLayer(layerIndex, sourceImage , tilesetIndex, gameObject){
        let tilesetIdx = tilesetIndex || 0;
        let tileset = this.tilesets[tilesetIdx];
        let layer = this.map.layers[layerIndex];
        if (!layer || this.getLayers()[layerIndex].type != this.layerTypes.TILE_LAYER) {
            this.k.debug.error("This layer is not type tile layer");
            return;
        }
        let w = layer.width;
        let h = layer.height;
        let tw = this.map.tilewidth;
        let th = this.map.tileheight;
        let obj = gameObject || this.k.add([
            this.k.pos(layer.x, layer.y)
        ]);
        if (w * h != layer.data.length) {
            this.k.debug.error("Layer data is incorrect.");
            return;
        }
        for (let i = 0; i < layer.data.length; i++) {
            const elem = layer.data[i];
            let x;
            let y;
            if (i != 0) {
                x = i % w;
                y = (i - x) / w;
            } else {
                x = 0;
                y = 0;
            }
            if (elem == 0) {
                continue;
            }
            let tileFrame = elem - 1;
            let comps = [];
            comps.push(this.k.sprite(sourceImage, {
                frame: tileFrame
            }));
            comps.push(this.k.pos(x * tw, y * th));
            comps.push(this.k.tile());
            comps.push(this.k.offscreen());
            if (!tileset) {
                this.k.debug.error("Tileset cannot be found");
                return;
            }
            for (let tile of tileset.tiles){
                if (tile.id == tileFrame){
                    for (let prop of tile.properties) {
                        if (checkProperty(prop, "solid", "bool", false, this.k)) {
                            comps.push(this.k.area());
                            comps.push(this.k.body({
                                isStatic: true
                            }));
                        } else if (checkProperty(prop, "tag", "string", "")) {
                            let tags = prop.value.split(" ");
                            for (let tag of tags) {
                                comps.push(tag);
                            }
                        }
                    }
                }
            }
            obj.add(comps);
        }
        return obj;
    }
    /**
     * Adds an object layer to a kaboom game.
     * @param {number} layerIndex Index of the layer in the map, use getLayerIndex to retrieve it from name.
     * @param {GameObj | null} gameObject The game object to implement the layer to. If not specified, a new one will be created.
     * @returns {GameObj<any>} A game object which the layer is implemented to.
     */
    addObjectLayer(layerIndex, gameObject){
        let layer = this.map.layers[layerIndex];
        if (!layer || this.getLayers()[layerIndex].type != this.layerTypes.OBJECT_LAYER) {
            this.k.debug.error("This layer is not type object layer");
            return;
        }
        let obj = gameObject || this.k.add([
            this.k.pos(layer.x, layer.y)
        ]);
        for (let object of layer.objects) {
            let comps = [];
            comps.push(this.k.pos(object.x, object.y));
            if (object.properties) {
                for (let prop of object.properties) {
                    if (checkProperty(prop, "sprite", "string", false)) {
                        comps.push(this.k.sprite(prop.value));
                    } else if (checkProperty(prop, "area", "bool", false)) {
                        comps.push(this.k.area({shape: new this.k.Rect(this.k.vec2(0),object.width, object.height)}));
                    } else if (checkProperty(prop, "body", "bool", false)) {
                        comps.push(this.k.body());
                    } else if (checkProperty(prop, "tags", "string", "")) {
                        let tags = prop.value.split(" ");
                        for (let tag of tags) {
                            comps.push(tag);
                        }

                    }
                }
                obj.add(comps);
            } else {
                this.k.debug.error("Cannot produce an object without custom properties");
            }
        }
        return obj;
    }
    /**
     * Add all layers in the map into a kaboom game. All tile layers must use the same tileset and source image
     * @param {GameObj<any>} gameObject The game object to implement the layer to. If not specified, a new one will be created.
     * @param {string} sourceImage The name used to import image to Kaboom.
     * @param {number} tilesetIndex Index of the tileset. Use getTilesetIndex function to retrieve it from name.
     * @returns {GameObj<any>} A game object which the layer is implemented to.
     */
    addAllLayers(gameObject, sourceImage, tilesetIndex){
        let obj = gameObject || this.k.add([
            this.k.pos(0, 0)
        ]);
        let layerDatas = this.getLayers();
        for (let i in layerDatas) {
            let val = layerDatas[i];
            if (val.type == this.layerTypes.OBJECT_LAYER) {
                obj = this.addObjectLayer(i, obj);
            } else if (val.type == this.layerTypes.TILE_LAYER) {
                obj = this.addTileLayer(i, sourceImage, tilesetIndex, obj);
            }
        }
        return obj;
    }
}
function checkProperty(prop, name, type, not, k){
    if (prop.name == name) {
        if (prop.type == type) {
            if (prop.value != not) {
                return true;
            } else {
                return false;
            }
        } else {
            k.debug.error("Incorrect Data type for property: ${name}");
        }

    } else {
        return false;
    }
}
