# Tiled Importer For Kaboom Documentation

## Introduction

This plugin is designed to import and implement tiled maps to kaboom.js games. This extension only supports csv encoding and other types are not planned to supported any time soon.

## Usage / Documentation

### Functions

**Initialization**

Just use import it and add it to plugins section:

``` js
import tiledImporter from "tiledimporter-kaboom";
import kaboom from "kaboom"İ
const k = kaboom({
    // the plugin
    plugins: [tiledImporter]
});
```
**Importer**

The importer is a class that contains all of map and tileset data as well as the methods to load them. To have the importer use this:
```js
let importer = k.importTiledMap(map, tilesets[]);
```
The `map` should be a path to the json file or the map data itself.
The `tilesets[]` should be an array of strings to json files or the data itself. If you wish to import tilesets from the map do not pass any value for this argument.

**Loading Data**

Two functions exist for loading data and they are:
```js
importer.loadMap()
importer.loadTilesets()
```
Both of these functions use promises to handle async loading so use async/await or another kind of implementation to handle them. These do not return anything but load the data to be used by the `importer` class. Please invoke `loadTilesets` even you wish to use a built in one.

**Retrieving Data**

There are 3 functions that can give data about the map and the tilesets.
```js
importer.getLayers()
```
This function returns an array to represent name and type of each layer. Let us see an example object:
```js
[
    {
        name: "Foreground",
        type: 1
    },
    {
        name: "objects",
        type: 2

    }
]
```
An enumeration implementation was used for handling layer types, it is accessible from the `importer`class as `layerTypes`.

```js
importer.getTilesets()
```
Just returns a array of tileset names.

```js
importer.getTilesetIndex(name)
importer.getLayerIndex(name, type)
```
These functions are used to get the index of tileset and layer based on their names. For layers, `type` parameter is optional, can be used to differentiate among layer that have same names. It must be an number according to the `layerTypes` enumaration. Indexes retrieved from these methods will be used for implementation methods.

**Implementation Methods**

There are 3 implementation methods.
All of these methods have somethings in common:
* All of them return a gameobject referance where the layer is implemented
* All of them can take a `gameObject` parameter where the game object is specified to implement the layer to. If not specified new one will be created.

``` js
importer.addTileLayer(layerIndex, sourceImage, tilesetIndex, gameObject, optimizationMode, drawAsOneImage)
importer.addObjectLayer(layerIndex, gameObject)
```
Both of these methods take `layerIndex` as returned from `getLayerIndex` method.
`sourceImage` refers to the kaboom sprite name implemented while loading the sprite. Such resources must be implement in your code. `TilesetIndex` is the index of tileset returned from `getTilesetIndex` method. `optimizeMode` is for solid tiles who will be covered with static body/area components. Since each tile will have its own body component, it might impact performance. This paremeter can allow collision objects expand horizontally or vertically to reduce their numbers. This paremeter accepts an enumeration defined at the tiledImporter class called: `optimizationModes`. It has values of `VERTICAL`, `HORIZONTAL`, `NONE`. `drawAsOneImage` parameter denotes whether to render the tileLayer as seperate cell objects or as a single object with a custom component, `mapDrawer`. This component automatically handles dynamic rendering with camera so it will not render any part that is not shown.

```js
importer.addAllLayers(gameObject, sourceImage, tilesetIndex, optimizationMode, drawAsOneImage)
```
This method loads all layers from the map but there is an condition, all tile layer must use the same `sourceImage`, `tilesetIndex`, `optimizationMode` and `drawAsOneImage` as required by the method.

### Tiled Custom Properties

Custom properties implemented in tiled maps and tilesets are used for assigning components to gameobjects. For now and probably in the future, only custom properties assigned to objects in objects layers and tilesets for tile layers will be used for assingning components.

**Tileset Properties**
|Property|Type|Description|
|:--:|:--:|:---|
|tags|string|tags that will be added to the object, a whitespace ` ` will be used for seperating them so multiple ones can be added.|
|solid|bool|what the tile should be solid (static). An area and body is added.|

`tile` and `offscreen` components are added by default.

**Object Properties**

|Property|Type|Description|
|:--:|:--:|:---|
|tags|string|tags that will be added to the object, a whitespace ` ` will be used for seperating them so multiple ones can be added.|
|area|bool|adds a area component, uses width and height property of the object to construct a `Rect` positioned at relative 0.|
|body|bool|Adds a body component, it wont add an area component by default so do it yourself.|
|sprite|string|Adds the sprite component where the image name is taken from the value.|

