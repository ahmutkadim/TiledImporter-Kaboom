import kaboom from 'kaboom';
import tiledImporter from '../lib/tiledImporter.js';

const k = kaboom({
    width: 640,
    height: 360,
    letterbox: true,
    background: [0, 0, 0],
    // specifying plugin here
    plugins: [tiledImporter],
});

// for visualizing the internals
k.debug.inspect = true;

// creating sprites, you must proccess them yourself
k.loadSprite('bomb', 'assets/Bomb Off.png');
k.loadSprite('box', 'assets/Idle.png');
k.loadSprite('tiles', 'assets/Terrain (32x32).png', {
    sliceX: 19,
    sliceY: 13,
});
let importer = k.importTiledMap('tiled/tilemap.tmj', ['tiled/tileset.tsj']);
async function main() {
    await importer.loadMap();
    await importer.loadTilesets();
    // fast implementation
    //let obj = importer.addAllLayers(null, "tiles", 0)

    // long implementation

    // get tileset id
    let tileId = importer.getTilesetIndex('Terrain (32x32)');
    // get tile layer with both type and name
    let tileLayerId = importer.getLayerIndex(
        'level',
        importer.layerTypes.TILE_LAYER
    );
    // get object layer with just naem
    let objectLayerId = importer.getLayerIndex('materials');
    let mainObj;
    // add tile layer with optimization of horizontal combining
    mainObj = importer.addTileLayer(
        tileLayerId,
        'tiles',
        tileId,
        null,
        importer.optimizationModes.HORIZONTAL,
        true
    );
    // for vertical optimization
    //mainObj = importer.addTileLayer(tileLayerId, "tiles", tileId, null, importer.optimizationModes.VERTICAL)

    // add object layer
    mainObj = importer.addObjectLayer(objectLayerId, mainObj);
}
// moving camera added, with WASD
k.onUpdate(() => {
    let x = -k.isKeyDown('a') + k.isKeyDown('d');
    let y = -k.isKeyDown('w') + k.isKeyDown('s');
    k.camPos(k.camPos().add(k.vec2(x * 10, y * 10)));
});

main();
