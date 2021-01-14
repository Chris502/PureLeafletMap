# PureLeafletMap

A React map component that allows geoJSON shapes to be drawn, edited, and loaded into leaflet layers

Built with leaflet.js and leaflet.pm

Leaflet Geosearch uses the Google Provider

Check `index.d.ts` to see the props.

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
### searchProvider:

_Type:_ `string`

_Default:_ `google`

_Supported Providers:_

 - ESRI: `esri`
 - GoogleMaps*: `google`
 - Open Street maps: `openstreet`
 - LocationIQ*: `loqIQ`
 - Bing*: `bing`
 - Open Cage: `opencage`

* providers need an API key for access

### apiKey:

_Type:_ `string`

_Default:_ `''`

_Description:_ API key for Google maps

---

### center:

_Type:_ `[lat, lng]`

_Default:_ `[38.194706, -85.71053]`

_Description:_ The starting center position for the map

---

### markerHtml:

_Type:_ `string`

_Default:_ `<svg width="8" height="8" version="1.1" xmlns="http://www.w3.org/2000/svg"> <circle cx="4" cy="4" r="4" stroke="red" fill="red" stroke-width="0" /></svg>`

_Description:_ Icon for marker when searching


### mapCount:
_Type:_ `number`

_Default:_ `''`

_Description:_ Interger to render more than 1 map on the same page. (i.e....
`mapCount={1}` makes Map Div ID:`mapid1`)

### getBounding: 
_Type:_ `Function`

_Default:_`false`

_Optional:_ `true`

_Description:_ Function that returns the bounding box of the current visible
map.

_Example_: `(data) => data` where data is: 
```{
  "_southWest": {
    "lat": 37.54239958054067,
    "lng": -99.90966796875001
  },
  "_northEast": {
    "lat": 39.404366615861036,
    "lng": -96.40777587890625
  }
}```

### providerInput:
_Type:_ `string`

_Optional:_ `true`

_Description:_ String to use to query geosearch control.

``` NOTE: Currently only available when provider = 'openstreet' ```


### providerResults: (data: ResultType[] | []) => void;
_Type:_ `Function`

_Optional:_ `true`

_Description:_ Function to return geosearch results to UI.

_Required:_ If `providerInput` is supplied to Map. 

### hideSearch:
_Type:_ `boolean`

_Optional:_ `true`

_Default:_ `false`

_Description:_ A flag to disable/hide the search button included on the map.
