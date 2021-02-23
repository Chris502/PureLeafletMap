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

## tileProvider:

_Type:_ `string`

_optional_: `true`

_Default:_ `OpenStreetMap.Mapnik`

_Description:_ List of providers are [Here](https://github.com/leaflet-extras/leaflet-providers/blob/master/leaflet-providers.jshttps://github.com/leaflet-extras/leaflet-providers/blob/master/leaflet-providers.js)
Folling keys are `MAP_CREATOR.variant` ex: `Esri.WorldStreetMap` 

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

---

### mapCount:

_Type:_ `number`

_Default:_ `''`

_Description:_ Interger to render more than 1 map on the same page. (i.e....
`mapCount={1}` makes Map Div ID:`mapid1`)

---

### getBounding: 

_Type:_ `Function`

_Default:_`false`

_Optional:_ `true`

_Description:_ Function that returns the bounding box of the current visible
map. Fired on zoomEnd

_Example_: `(data) => data` where data is:

{
  "_southWest": {
    "lat": 37.54239958054067,
    "lng": -99.90966796875001
  },
  "_northEast": {
    "lat": 39.404366615861036,
    "lng": -96.40777587890625
  }
  zoom: 13
}

---

### hideSearch:

_Type:_ `boolean`

_Optional:_ `true`

_Default:_ `false`

_Description:_ A flag to disable/hide the search button included on the map.

---

### geoLocate:

_Type:_ ```type ResultType = {
        x: string // lon,
        y: string // lat,
        label: string // formatted address
        bounds: string[][]
        raw: RawType // raw provider result
};```

_Optional:_ `true`

_Description:_ Allows outside results from geolocation to be passed to the map. For more informations about types look in `index.d.ts`

```NOTE: Currently only works with `openstreet` as the `provider`.```

---

### tooltipContent:

_Type:_ ```{
    comp?: string;
    func?: () => void
    tooltip?: string;
    values?: Array<string>
}```

_Optional:_ `true`

_Description:_ 
comp: is the popup content when a marker is clicked
func: function to pass into popup
tooltip: tooltip content.
values: If template string is used, This is the array of fields to check in the features `properties` field.

_Example:_
This works for popup/tooltip
```
comp: `<div>this is a {var}</div>`
values: ['var']
and the GeoJSON: 

{
    type: 'Feature',
    properties: {
      var: 'test'
      key: 'cbb7672e-1e85-4c0b-8bcb-5bfc5af2d736',
    },
    geometry: {
      type: 'Point',
      coordinates: [-85.76399, 38.257058],
    },
  },```

  compiles to 

  ```<div>this is a test</div>```
