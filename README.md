# PureLeafletMap
React Component with using pure leaflet.js
Currently Leaflet Geosearch used the Google Provider working on other providers.

# Getting Started: 
npm install pure-leaflet


# Props:

### onShapeChange: 
(layers) => {} : fired when a shape is drawn/edited on map. returns : Array<{geoJSON}> ...[{geoJSON}, {geoJSON}]

### features: 
Array<{geoJSON}> accepts an array of geoJSON features to be loaded/drawn on to map on load.

### apiKey:
API key for google maps. More providers are coming.
