# Tiled Importer for Kaboom

This is an [Kaboom](https://kaboomjs.com) plugin that allows to import [Tiled map editor](https://www.mapeditor.org) maps and implement the data to kaboom.js.

## How Does It Work

This extension relies upon parsing maps as json data. File extension does not have to be json, `.tmj` and `.tsj` will work just fine.

## Installation

This plugin exists as a single file, just copy [tiledImporter.js](/lib/tiledImporter.js) to your project and reference it or better yet install it from npm:
```
npm i tiledimporter-kaboom
```

## Importing Json Data

If you want, you can parse json on your code however, this plugin also supports loading it from a path via fetch api.

## Tileset Support

This plugin requires and expects tileset resource for rendering tile layers, it supports loading it from maps as well as from external files. Visit documentation for that.

## Importing Implementation

For importing components, custom properties set on Tiled is primarily used for implementation, there are limited components supported for now but I am open to suggestions for more.

## Usage

Please check out the [example source code](example/main.js) and the [documentation](lib/README.md). You can see the preview of the example [here](https://ahmutkadim.github.io/TiledImporter-Kaboom/).



