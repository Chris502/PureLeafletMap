# PureLeafletMap

A React map component that allows geoJSON shapes to be drawn, edited, and loaded into leaflet layers

Built with leaflet.js and leaflet.pm

Leaflet Geosearch uses the Google Provider

# Getting Started:

`npm install pure-leaflet`

# Usage

`import Map from 'pure-leaflet'`

# Props:

## editable

_Type:_ `boolean`

_Default:_ `true`

_Description:_ Toggle edit/draw control

---

## cutMode

_Type:_ `boolean`

_Default_: `false`

_Requires_: `editable: true`

_Description:_ Toggles ability to cut polygons/shapes

---

### onShapeChange

_Type:_ `(Array<geoJSON>) => {}`

_Default:_ `noop`

_Description:_ Fired when a shape is drawn/edited on map

---

### features:

_Type:_ `Array<geoJSON>`

_Default:_ `null`

_Description_: Array of geoJSON features to be drawn on the map

---

### apiKey:

_Type:_ `string`

_Default:_ `''`

_Description:_ API key for Google maps

---

### center:

_Type:_ `[lat, lng]`

_Default:_ `[38.194706, -85.71053]`

_Description:_ The starting center position for the map
