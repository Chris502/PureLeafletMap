import React from 'react'
import L from 'leaflet'
import geojsonArea from 'geojson-area';
import map from 'lodash.map';
import min from 'lodash.min';
import max from 'lodash.max';
import noop from 'lodash.noop'
import isEqual from 'lodash.isequal'
import uuid from 'uuid/v4';
import flatten from 'lodash.flatten';
import cloneDeep from 'lodash.cloneDeep';
import { GoogleProvider, GeoSearchControl } from 'leaflet-geosearch';
import './Map.css'


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
    const map = L.map('mapid').setView([38.194706, -85.71053
    ], 13);
    const tiles = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    tiles.addTo(map)
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
    map.on('geosearch/showlocation', (result) => {
      // options for marker
      // To-Do add prop to change icon for marker
      const marker_options = {
        draggable: false,
      };
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
      this.props.featureSaver(features)
    })
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
        stateName: 'add-markers',
        icon: 'fa-space-shuttle fa-lg',
        title: 'add random markers',
        onClick: (control) => {
          if (this.state.tileLayer === 'street') this.setState({
            tileLayer: 'sat'
          },
            () => tiles.setUrl('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'))
          control.state('remove-markers');

        },

      }, {
        icon: 'fa-car fa-lg',
        stateName: 'remove-markers',
        onClick: (control) => {
          if (this.state.tileLayer === 'sat') this.setState({
            tileLayer: 'street'
          },
            () => tiles.setUrl('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'))
          control.state('add-markers');
        },
        title: 'remove markers',

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
    map.pm.addControls({
      position: 'topright',
      drawCircle: false,
      drawPolyline: false,
      // cutPolygon: false
    });

    // Enable with options, and disable to save them.
    map.pm.enableDraw('Poly', {
      allowSelfIntersection: false,
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
      this.props.featureSaver(this.state.features)
      layer.layer.bindTooltip((layer) => {
        return `Area: ${area + 'mi'}<sup>2</sup>`;
      }
      )
      layer.layer.on('pm:edit', (e) => {
        const editedArea = addArea(e.target.toGeoJSON())
        const editedLayer = e.target.toGeoJSON();
        e.target.on('pm:markerdragend', () => {
          map.eachLayer(layer => {
            if (layer.options.key) {
              const editedLayer = layer.toGeoJSON()
              editedLayer.properties.key = e.target.options.key
              const filterFeats = features.filter(current => {
                return current.properties.key !== layer.options.key
              })
              filterFeats.push(editedLayer)
              this.props.featureSaver(filterFeats)
              this.setState({ features: filterFeats })
            }
          })
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
      map.eachLayer(layer => {
        if (layer.options.key) {
          const nonDeletedLayer = layer.toGeoJSON();
          const remainingLayers = features.filter(current => current.properties.key !== deletedLayer.layer.options.key)
          this.props.featureSaver(remainingLayers)
          this.setState({ features: remainingLayers })
        }
      })
      if (this.state.features.length === 1) {
        const noFeatures = features.filter(current => current.properties.key !== deletedLayer.layer.options.key)
        this.props.featureSaver(noFeatures)
        this.setState({ features: noFeatures })
      }
    });
    // add cut method to entire map. listens for layer to be cut.
    map.on('pm:cut', (cutLayer) => {
      const newLayer = cutLayer.layer.toGeoJSON()
      const cutOutArea = addArea(newLayer.features[0])

      cutLayer.layer.bindTooltip((layer) => {
        return `Area: ${cutOutArea + 'mi'}<sup>2</sup>`;
      })
    })
    if (this.props.features && this.state.features === null) {

      this.setState({ features: this.props.features })
      this.props.features.map(currentFeature => {
        const savedFeature = L.GeoJSON.geometryToLayer(currentFeature).bindTooltip((layer) => {
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
                this.props.featureSaver(filterFeats)
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
        savedFeature.addTo(map)
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
  featureSaver: noop,
  apiKey: '',
}
export default Map