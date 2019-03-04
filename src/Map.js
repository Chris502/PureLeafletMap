import React from 'react'
import L from 'leaflet'
import geojsonArea from 'geojson-area';
import map from 'lodash.map';
import min from 'lodash.min';
import 'leaflet.pm';
import 'leaflet-easybutton'
import max from 'lodash.max';
import noop from 'lodash.noop'
import isEqual from 'lodash.isequal'
import uuid from 'uuid/v4';
import flatten from 'lodash.flatten';
import cloneDeep from 'lodash.cloneDeep';
import { GoogleProvider, GeoSearchControl } from 'leaflet-geosearch';
import './Map.css'


const defaultIcon = `
<svg width="8" height="8" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <circle cx="4" cy="4" r="4" stroke="red" fill="red" stroke-width="0"/>
</svg>
`;
const generateIcon = (html) => new L.divIcon({
  className: 'my-div-icon',
  html,
});


const getCoords = (arr) => {
  if (!arr || !arr.length) return [];
  if (arr.length === 2 && typeof arr[1] === 'number') return [arr];
  if (arr[0].length && typeof arr[0][1] === 'number') return arr;
  if (arr[0][0].length && typeof arr[0][0][1] === 'number') return getCoords(flatten(arr));
  if (arr[0][0][0].length && typeof arr[0][0][0][1] === 'number') return getCoords(flatten(arr));
  return arr;
};

const getBounds = (polygons, points) => {
  if (polygons.length === 0 && points.length === 0) return [35, -83];
  let coords = [];
  map(polygons, (poly) => {
    coords = coords.concat(getCoords(poly.geometry.coordinates));
  });
  const lats = [];
  const longs = [];
  map(coords, (coord) => {
    lats.push(coord[1]);
    longs.push(coord[0]);
  });
  const c1 = L.latLng(max(lats), max(longs));
  const c2 = L.latLng(min(lats), min(longs));
  return L.latLngBounds(c1, c2);
};

const addArea = featObj => {
  const { geometry } = featObj;
  const area = geojsonArea.geometry(geometry);
  const x = area / 2590000;
  return Number.parseFloat(x).toFixed(4);
};
const center = [38.194706, -85.71053]

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      features: null,
      mapState: null,
      tileLayer: 'street'
    }
  }
  componentDidMount() {
    const map = L.map('mapid');
    const tiles = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: 'Map data: Google &copy;',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    tiles.addTo(map)
    if (map) map.setView(center, 13)
    const provider = new GoogleProvider({
      params: {
        // hardcoded for now, will need to pass via props
        key: this.props.apiKey
      },
    });
    const searchControl = new GeoSearchControl({
      provider,
      animateZoom: false,
      autoClose: true,
    });
    map.addControl(searchControl)
    const marker_options = {
      draggable: false,
      icon: generateIcon(defaultIcon)
    };
    map.on('geosearch/showlocation', (result) => {
      // options for marker
      // To-Do add prop to change icon for marker

      const features = this.state.features !== null ? cloneDeep(this.state.features) : []
      const marker = L.marker(result.target._lastCenter, marker_options).bindTooltip(layer => {
        return result.location.label;
      })
      // enable marker drawing with options
      map.pm.enableDraw('Marker', marker_options);
      map.pm.disableDraw('Marker');
      // enable those options
      marker.pm.enable(marker_options);
      const key = uuid()
      marker.options.key = key
      marker.addTo(map)
      const geoJson = marker.toGeoJSON()
      geoJson.properties.key = key
      features.push(geoJson)
      this.setState({ features })
      this.props.onShapeChange(features)
    })
    map.pm.Draw.Cut.options = { snappable: false }
    const zoomToShapes = (stateFeatures) => {
      if (map) {
        if (stateFeatures.length > 0) {
          const bounds = getBounds(stateFeatures);
          map.fitBounds(bounds);
        }
      }
    }
    const button = L.easyButton({
      position: 'bottomleft',
      states: [{
        stateName: 'sat-view',
        icon: '<span>Satellite View</span>',
        title: 'Switch to Satellite View',
        onClick: (control) => {
          if (this.state.tileLayer === 'street') this.setState({
            tileLayer: 'sat'
          },
            () => tiles.setUrl('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'))
          control.state('steet-view');

        },

      }, {
        icon: '<span>Street View</span>',
        stateName: 'steet-view',
        onClick: (control) => {
          if (this.state.tileLayer === 'sat') this.setState({
            tileLayer: 'street'
          },
            () => tiles.setUrl('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'))
          control.state('sat-view');
        },
        title: 'Switch to Street View',

      }]
    });
    const ZoomToShape = L.easyButton({
      position: 'bottomleft',
      states: [
        {
          icon: '<span>Zoom to Shapes</span>',
          title: 'Zoom to Shapes',
          onClick: () => zoomToShapes(this.state.features)
        }
      ]
    })
    const buttons = [button, ZoomToShape]
    L.easyBar(buttons, {
      position: 'bottomleft'
    }).addTo(map)

    // Add drawcontrol to the map
    if (this.props.editable) map.pm.addControls({
      position: 'topright',
      drawCircle: false,
      drawPolyline: false,
      dragMode: false,
      drawMarker: false,
      cutPolygon: this.props.cutMode,
    });

    // Enable with options, and disable to save them.
    map.pm.enableDraw('Poly', {
      allowSelfIntersection: false,
      snapMiddle: false,
      finishOn: 'dblclick',
    });
    map.pm.disableDraw('Poly');

    // Draw new shape, adds to current shapes object if present
    map.on('pm:create', (layer) => {

      const features = this.state.features ? cloneDeep(this.state.features) : [];
      const area = addArea(layer.layer.toGeoJSON())
      const drawnLayer = layer.layer.toGeoJSON()
      const key = uuid()
      layer.layer.options.key = key
      drawnLayer.properties.key = key
      features.push(drawnLayer)
      this.setState({ features })
      this.props.onShapeChange(this.state.features)
      layer.layer.bindTooltip((layer) => {
        return `Area: ${area + 'mi'}<sup>2</sup>`;
      }
      )
      layer.layer.on('mouseover', (event) => {
        event.target.setStyle({
          color: 'green',
          opacity: 1,
          fillOpacity: 0.2,
        })
      });
      layer.layer.on('mouseout', (event) => {
        event.target.setStyle({
          color: '#3388FF',
          opacity: 1,
          fillOpacity: 0.2,
        })
      });
      layer.layer.on('pm:edit', (e) => {
        const editedArea = addArea(e.target.toGeoJSON())
        const editedLayer = e.target.toGeoJSON();
        const filterFeats = this.state.features.filter(current => {
          return current.properties.key !== e.target.options.key
        })
        e.target.on('pm:markerdragend', () => {
          editedLayer.properties.key = e.target.options.key
          filterFeats.push(editedLayer)
          this.props.onShapeChange(filterFeats)
          this.setState({ features: filterFeats })
        })

        e.target.bindTooltip((layer) => {
          return `Area: ${editedArea + 'mi'}<sup>2</sup>`;
        }
        )
      })
    })

    // Checks Map layers after removal, updates map state
    map.on('pm:remove', (deletedLayer) => {
      const features = this.state.features ? cloneDeep(this.state.features) : []
      if (this.state.features.length === 1 ) {

        const noFeatures = features.filter(current => {
          map.eachLayer(layer => {
    
            if (layer.options.key === deletedLayer.layer.options.key) {
              
              map.removeLayer(layer)}
          })
          if (current.type === 'FeatureCollection') {
            const multiFeats = current.features[0]
            return multiFeats.properties.key !== deletedLayer.layer.options.key
          } else {
            return current.properties.key !== deletedLayer.layer.options.key
          }
        })

        this.props.onShapeChange(noFeatures)
        this.setState({ features: noFeatures })
      } else {

        map.eachLayer(layer => {
  

          if (layer.options.key) {
            const remainingLayers = features.filter(current => {
              if (current.type === 'FeatureCollection') {
                const multiFeats = current.features[0]
                return multiFeats.properties.key !== deletedLayer.layer.options.key
              } else {
              
                return current.properties.key !== deletedLayer.layer.options.key
              }
            })
    
            this.props.onShapeChange(remainingLayers)
            this.setState({ features: remainingLayers })
          }
        })
      }
      
    });

    map.on('pm:globaleditmodetoggled', e => {
      const multiPoly = this.state.features.filter(current => current.type === "FeatureCollection")
      multiPoly.map(currentMulti => {
        const currentFeatures = currentMulti.features[0]
        map.eachLayer(layer => {
          if (layer.options.key === currentFeatures.properties.key) {
            layer.pm.disable()
          }
        })
      })
    });
    const cut_options = {
      templineStyle: { color: 'darkgrey', dashedArray: [5, 5] },
      hintlineStyle: { color: 'green', dashedArray: [5, 5] }
    }
    map.pm.Draw.Cut.enable(cut_options
    );
    map.pm.Draw.Cut.disable()
    // add cut method to entire map. listens for layer to be cut.
    map.on('pm:cut', (cutLayer) => {

      const mapFeatures = cloneDeep(this.state.features)
      const newLayer = cutLayer.layer.toGeoJSON()
      const newFeatObj = newLayer.features[0]
      const cutOutArea = addArea(newFeatObj)
      newFeatObj.properties.key = cutLayer.layer.options.key
      const nonCutLayers = mapFeatures.filter(current => {
        if (current.type === "FeatureCollection") {
          const multiFeature = current.features[0]
          return multiFeature.properties.key !== cutLayer.layer.options.key
        } else {
          return current.properties.key !== cutLayer.layer.options.key
        }
      })
      cutLayer.layer.on('mouseover', (event) => {
        event.target.setStyle({
          color: 'green',
          opacity: 1,
          fillOpacity: 0.2,
        })
      });
      cutLayer.layer.on('mouseout', (event) => {
        event.target.setStyle({
          color: '#3388FF',
          opacity: 1,
          fillOpacity: 0.2,
        })
      });
      nonCutLayers.push(newLayer)
      this.props.onShapeChange(nonCutLayers)
      this.setState({ features: nonCutLayers })
      cutLayer.layer.bindTooltip((layer) => {
        return `Area: ${cutOutArea + 'mi'}<sup>2</sup>`;
      })
    })
    if (this.props.features && this.state.features === null) {

      this.setState({ features: this.props.features })
      this.props.features.map(currentFeature => {
        if (currentFeature.geometry.type === 'Point') {
         
          const pointLayer = L.GeoJSON.geometryToLayer(currentFeature)
          const pointMarker = L.marker(pointLayer._latlng, marker_options)
          map.pm.enableDraw('Marker', marker_options);
          map.pm.disableDraw('Marker');
          pointMarker.options.key = currentFeature.properties.key
          pointMarker.pm.enable(marker_options);
          pointMarker.addTo(map)

        }
        else {
        const savedFeature = L.GeoJSON.geometryToLayer(currentFeature, ).bindTooltip((layer) => {
          const savedArea = addArea(currentFeature)
          return `Area: ${savedArea + 'mi'}<sup>2</sup>`;
        }

        )
        savedFeature.on('pm:edit', (e) => {
          const editedArea = addArea(e.target.toGeoJSON())
          const editedLayer = e.target.toGeoJSON();
          e.target.on('pm:markerdragend', () => {
            map.eachLayer(layer => {
              if (layer.options.key) {
                // const editedLayer = layer.toGeoJSON()
                const stateFeatures = cloneDeep(this.state.features)
                editedLayer.properties.key = e.target.options.key
                const filterFeats = stateFeatures.filter(current => {
                  return current.properties.key !== e.target.options.key
                })
                filterFeats.push(editedLayer)
                this.props.onShapeChange(filterFeats)
                this.setState({ features: filterFeats })
              }
            })
          })

          e.target.bindTooltip((layer) => {
            return `Area: ${editedArea + 'mi'}<sup>2</sup>`;
          }
          )
        })
        savedFeature.options.key = currentFeature.properties.key
        savedFeature.on('mouseover', (event) => {
          event.target.setStyle({
            color: 'green',
            opacity: 1,
            fillOpacity: 0.2,
          })
        });
        savedFeature.on('mouseout', (event) => {
            event.target.setStyle({
            color: '#3388FF',
            opacity: 1,
            fillOpacity: 0.2,
          })
        });
        savedFeature.addTo(map)
      }
    }
      )
    }
    this.setState({ mapState: map })
  }
  shouldComponentUpdate(prevState, nextState) {
    if (isEqual(prevState.features, nextState.features)) {
      return false
    }
    return true;
  }
  render() {
    return (
      <div id='mapid'></div>
    )
  }
}
Map.defaultProps = {
  onShapeChange: noop,
  apiKey: '',
  cutMode: false,
  editable: true
}
export default Map