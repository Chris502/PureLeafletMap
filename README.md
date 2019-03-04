# PureLeafletMap
A React map component that allows geoJSON shapes to be drawn, edited, and loaded into leaflet layers. Built with leaflet.js and leaflet.pm
Currently Leaflet Geosearch uses the Google Provider working on other providers.

# Getting Started: 
 `npm install pure-leaflet`

### Usage

``` import Map from 'pure-leaflet' ```

# Props:

### editable: boolean
Toggle edit/draw control.

### cutMode: boolean 
Requires: editable: true
toggles ability to cut polygons/shapes

### onShapeChange: 
(layers) => {} : fired when a shape is drawn/edited on map. returns : Array<{geoJSON}> ...[{geoJSON}, {geoJSON}]

### features: 
Array<{geoJSON}> accepts an array of geoJSON features to be loaded/drawn on to map on load.

### apiKey:
API key for google maps. More providers are coming.
