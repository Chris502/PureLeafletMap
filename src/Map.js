import React from "react";
import L from "leaflet";
import "leaflet.pm";
import "leaflet-easybutton";
import "leaflet-providers"
import noop from "lodash.noop";
import isEqual from "lodash.isequal";
import uuid from "uuid/v4";
import cloneDeep from "lodash.clonedeep";
import { GeoSearchControl } from "leaflet-geosearch";
import "./Map.css";
import generateIcon, { getBounds, addArea } from "./helpers";
import providerSwitch from './providers';
import { OpenStreetMapProvider } from 'leaflet-geosearch';


class Map extends React.Component {
  state = {
    features: null,
    mapState: null,
    tileLayer: "street"
  };

  componentDidMount() {
    const { center, markerHtml } = this.props;

    // Initialize map to render at the ID returned from this class
    const map = L.map(!this.props.mapCount ? "mapid" : `mapid ${this.props.mapCount.toString()}`);

    // Set initial view at the center prop with a zoom level of 13
    map.setView(center, 13);
    const provider = providerSwitch(this.props.searchProvider, this.props.apiKey)
    const tiles = L.tileLayer.provider(this.props.tileProvider || 'OpenStreetMap.Mapnik');
    tiles.addTo(map);
    if (provider) {
      !this.props.hideSearch && map.addControl(
        new GeoSearchControl({
          provider,
          animateZoom: false,
          autoClose: true
        })
      );
    }
    const marker_options = {
      draggable: false,
      icon: generateIcon(markerHtml)
    };
    map.on("geosearch/showlocation", result => {

      const marker = L.marker(
        result.target._lastCenter,
        marker_options
      ).bindTooltip(layer => result.location.label);

      // enable those options
      marker.pm.enable(marker_options);
      const key = uuid();
      marker.options.key = key;
      // removes marker from openstreet providers
      /* 
      NEED TO REFACTOR!!!!!!!!!!
      */
      (provider !== 'openstreet') && marker.addTo(map);
      const geoJson = marker.toGeoJSON();
      geoJson.properties.key = key;

      // Update features with new point
      const features =
        this.state.features !== null ? cloneDeep(this.state.features) : [];
      features.push(geoJson);
      this.setState({ features });
      this.props.onShapeChange(features);
    });

    map.pm.Draw.Cut.options = { snappable: false };

    const button = L.easyButton({
      position: "bottomleft",
      states: [
        {
          stateName: "sat-view",
          icon: "<span>Satellite View</span>",
          title: "Switch to Satellite View",
          onClick: control => {
            if (this.state.tileLayer === "street")
              this.setState(
                {
                  tileLayer: "sat"
                },
                () =>
                  tiles.setUrl(
                    "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                  )
              );
            control.state("steet-view");
          }
        },
        {
          icon: "<span>Street View</span>",
          stateName: "steet-view",
          onClick: control => {
            if (this.state.tileLayer === "sat")
              this.setState(
                {
                  tileLayer: "street"
                },
                () =>
                  tiles.setUrl(
                    "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  )
              );
            control.state("sat-view");
          },
          title: "Switch to Street View"
        }
      ]
    });

    const zoomToShapes = stateFeatures => {
      if (stateFeatures.length > 0) {
        const bounds = getBounds(stateFeatures);
        map.fitBounds(bounds);
      }
    };

    const ZoomToShape = L.easyButton({
      position: "bottomleft",
      states: [
        {
          icon: "<span>Zoom to Shapes</span>",
          title: "Zoom to Shapes",
          onClick: () => zoomToShapes(this.state.features)
        }
      ]
    });

    const buttons = [button, ZoomToShape];

    L.easyBar(buttons, {
      position: "bottomleft"
    }).addTo(map);

    // Add drawcontrol to the map
    if (this.props.editable)
      map.pm.addControls({
        position: "topright",
        drawCircle: false,
        drawPolyline: false,
        dragMode: false,
        drawMarker: false,
        cutPolygon: this.props.cutMode
      });

    // Enable with options, and disable to save them.
    map.pm.enableDraw("Poly", {
      allowSelfIntersection: false,
      snapMiddle: false,
      finishOn: "dblclick"
    });

    map.pm.disableDraw("Poly");

    // Draw new shape, adds to current shapes object if present
    map.on("pm:create", layer => {
      const features = this.state.features
        ? cloneDeep(this.state.features)
        : [];
      const area = addArea(layer.layer.toGeoJSON());
      const drawnLayer = layer.layer.toGeoJSON();
      const key = uuid();
      layer.layer.options.key = key;
      drawnLayer.properties.key = key;
      features.push(drawnLayer);
      this.setState({ features });
      this.props.onShapeChange(this.state.features);
      layer.layer.bindTooltip(layer => {
        return `Area: ${area + "mi"}<sup>2</sup>`;
      });
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
      layer.layer.on("pm:edit", e => {
        const editedArea = addArea(e.target.toGeoJSON());
        const editedLayer = e.target.toGeoJSON();
        const filterFeats = this.state.features.filter(current => {
          return current.properties.key !== e.target.options.key;
        });
        e.target.on("pm:markerdragend", () => {
          editedLayer.properties.key = e.target.options.key;
          filterFeats.push(editedLayer);
          this.props.onShapeChange(filterFeats);
          this.setState({ features: filterFeats });
        });

        e.target.bindTooltip(layer => {
          return `Area: ${editedArea + "mi"}<sup>2</sup>`;
        });
      });
    });

    // Checks Map layers after removal, updates map state
    map.on("pm:remove", deletedLayer => {
      const features = this.state.features
        ? cloneDeep(this.state.features)
        : [];
      map.eachLayer(layer => {
        if (layer.options.key) {
          const nonDeletedLayer = layer.toGeoJSON();
          const remainingLayers = features.filter(current => {
            if (current.type === "FeatureCollection") {
              const multiFeats = current.features[0];
              return (
                multiFeats.properties.key !== deletedLayer.layer.options.key
              );
            } else {
              return current.properties.key !== deletedLayer.layer.options.key;
            }
          });
          this.props.onShapeChange(remainingLayers);
          this.setState({ features: remainingLayers });
        }
      });
      if (this.state.features.length === 1) {
        const noFeatures = features.filter(current => {
          map.eachLayer(layer => {
            if (layer.options.key === deletedLayer.layer.options.key)
              map.removeLayer(layer);
          });
          if (current.type === "FeatureCollection") {
            const multiFeats = current.features[0];
            return multiFeats.properties.key !== deletedLayer.layer.options.key;
          } else {
            return current.properties.key !== deletedLayer.layer.options.key;
          }
        });

        this.props.onShapeChange(noFeatures);
        this.setState({ features: noFeatures });
      }

    });

    map.on("pm:globaleditmodetoggled", e => {
      const multiPoly = this.state.features.filter(
        current => current.type === "FeatureCollection"
      );
      multiPoly.map(currentMulti => {
        const currentFeatures = currentMulti.features[0];
        map.eachLayer(layer => {
          if (layer.options.key === currentFeatures.properties.key) {
            layer.pm.disable();
          }
        });
      });
    });

    const cut_options = {
      templineStyle: { color: "darkgrey", dashedArray: [5, 5] },
      hintlineStyle: { color: "green", dashedArray: [5, 5] }
    };

    map.pm.Draw.Cut.enable(cut_options);

    map.pm.Draw.Cut.disable();

    // add cut method to entire map. listens for layer to be cut.
    map.on("pm:cut", cutLayer => {
      const mapFeatures = cloneDeep(this.state.features);
      const newLayer = cutLayer.layer.toGeoJSON();
      const newFeatObj = newLayer.features[0];
      const cutOutArea = addArea(newFeatObj);
      newFeatObj.properties.key = cutLayer.layer.options.key;
      const nonCutLayers = mapFeatures.filter(current => {
        if (current.type === "FeatureCollection") {
          const multiFeature = current.features[0];
          return multiFeature.properties.key !== cutLayer.layer.options.key;
        } else {
          return current.properties.key !== cutLayer.layer.options.key;
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

      if (this.props.features && this.state.features === null) {
        this.setState({ features: this.props.features });
        this.props.features.map(currentFeature => {
          if (currentFeature.geometry.type === 'Point') {
            const pointLayer = L.GeoJSON.geometryToLayer(currentFeature)
            const pointMarker = L.marker(pointLayer._latlng, marker_options)
            if (this.props.tooltipContent) {
              const options = {};
              this.props.tooltipContent.values &&
              this.props.tooltipContent.values.map(currentVal => {
                return options[currentVal] = currentFeature.properties[currentVal] || 'N/A' 
              })
              const customTip = (component) => {
                if (!pointMarker.isPopupOpen()) pointMarker.bindTooltip(component, {direction: 'top'}).openTooltip();
              }
              const customPop = () => {
                pointMarker.unbindTooltip();
              }

              pointMarker.bindPopup( L.Util.template(this.props.tooltipContent.comp, options))
              pointMarker.on('mouseover', () => customTip(L.Util.template(this.props.tooltipContent.tooltip, options)));
              pointMarker.on('click', () => customPop());
              // pointMarker.on('popupopen', () => L.DomEvent.on(document.getElementById('test'),
              //   'click',
              //   () => this.props.tooltipContent.func(true)
              // ))
              // pointMarker.on('popupclose', () => this.props.tooltipContent.func(false))

            }
            map.pm.enableDraw('Marker', marker_options);
            map.pm.disableDraw('Marker');
            pointMarker.options.key = currentFeature.properties.key
            pointMarker.pm.enable(marker_options);
            pointMarker.addTo(map)

          }
          else {
            const savedFeature = L.GeoJSON.geometryToLayer(currentFeature).bindTooltip((layer) => {
              const savedArea = addArea(currentFeature)
              return `Area: ${savedArea + 'mi'}<sup>2</sup>`;
            }

            )
            savedFeature.on('pm:edit', (e) => {
              const editedArea = addArea(e.target.toGeoJSON())
              const editedLayer = e.target.toGeoJSON();
              e.target.on("pm:markerdragend", () => {
                map.eachLayer(layer => {
                  if (layer.options.key) {
                    // const editedLayer = layer.toGeoJSON()
                    const stateFeatures = cloneDeep(this.state.features);
                    editedLayer.properties.key = e.target.options.key;
                    const filterFeats = stateFeatures.filter(current => {
                      return current.properties.key !== e.target.options.key;
                    });
                    filterFeats.push(editedLayer);
                    this.props.onShapeChange(filterFeats);
                    this.setState({ features: filterFeats });
                  }
                });
              });

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
      if (this.props.getBounding) {
        this.props.getBounding({bounds: map.getBounds(), zoom: map.getZoom()})
        map.on('zoomend', () => this.props.getBounding({bounds: map.getBounds(), zoom: map.getZoom()}))
        map.on('dragend', () => this.props.getBounding({bounds: map.getBounds(), zoom: map.getZoom()}))

      }
      this.setState({ mapState: map }, () => {
        setTimeout(function () { map.invalidateSize() }, 100)
      });
    }
  }
  shouldComponentUpdate(prevState, nextState, nextProps, prevProps) {
    if (isEqual(prevState.features, nextState.features)) {
      if (this.props.getBounding) return true
      return false;
    }
    return true;
  }
  componentWillReceiveProps(nextProps, prevProps) {
    if (nextProps.features !== prevProps.features) {
      this.setState({features: nextProps.features}, () => this.state.mapState.invalidateSize())
    }
    // Is GeoLocate Different? Yes? ReCenter map over New location
    if (!isEqual(nextProps.geoLocate, this.props.geoLocate)) {
      const resultBounds = nextProps.geoLocate[0].bounds
        ? new L.LatLngBounds(nextProps.geoLocate[0].bounds)
        : new L.LatLng(nextProps.geoLocate[0].y, nextProps.geoLocate[0].x).toBounds(10);
      this.state.mapState.fitBounds(resultBounds)
      return true
    }
    
    
   
  }
  componentDidUpdate(prevState) {
    // Check to see if features have changed
    // Filtering from a client side app
    if (this.state.features.length === 0
      || prevState.features.length !== this.state.features.length) {
       this.state.mapState.eachLayer((layer) => !layer._url && layer.remove())
    }
    // Entire Feature Object change?
    // Draw new markers
    // Polygons still WIP
    if (prevState.features !== this.state.features) {
      const marker_options = {
        draggable: false,
        icon: generateIcon(this.props.markerHtml)
      };
      this.props.features.map(currentFeature => {
        if (currentFeature.geometry.type === 'Point') {
          const pointLayer = L.GeoJSON.geometryToLayer(currentFeature)
          const pointMarker = L.marker(pointLayer._latlng, marker_options)
          if (this.props.tooltipContent) {
            const options = {};
            this.props.tooltipContent.values &&
            this.props.tooltipContent.values.map(currentVal => {
              return options[currentVal] = currentFeature.properties[currentVal] || 'N/A' 
            })
            const customTip = (component) => {
              if (!pointMarker.isPopupOpen()) pointMarker.bindTooltip(component, {direction: 'top'}).openTooltip();
            }
            const customPop = () => {
              pointMarker.unbindTooltip();
            }

            pointMarker.bindPopup( L.Util.template(this.props.tooltipContent.comp, options))
            pointMarker.on('mouseover', () => customTip(L.Util.template(this.props.tooltipContent.tooltip, options)));
            pointMarker.on('click', () => customPop());
            // pointMarker.on('popupopen', () => L.DomEvent.on(document.getElementById('test'),
            //   'click',
            //   () => this.props.tooltipContent.func(true)
            // ))
            // pointMarker.on('popupclose', () => this.props.tooltipContent.func(false))

          }
          this.state.mapState.pm.enableDraw('Marker', marker_options);
          this.state.mapState.pm.disableDraw('Marker');
          pointMarker.options.key = currentFeature.properties.key
          pointMarker.pm.enable(marker_options);
          pointMarker.addTo(this.state.mapState)

        }
        else {
          const savedFeature = L.GeoJSON.geometryToLayer(currentFeature).bindTooltip((layer) => {
            const savedArea = addArea(currentFeature)
            return `Area: ${savedArea + 'mi'}<sup>2</sup>`;
          }

          )
          savedFeature.on('pm:edit', (e) => {
            const editedArea = addArea(e.target.toGeoJSON())
            const editedLayer = e.target.toGeoJSON();
            e.target.on("pm:markerdragend", () => {
              this.state.mapState.eachLayer(layer => {
                if (layer.options.key) {
                  // const editedLayer = layer.toGeoJSON()
                  const stateFeatures = cloneDeep(this.state.features);
                  editedLayer.properties.key = e.target.options.key;
                  const filterFeats = stateFeatures.filter(current => {
                    return current.properties.key !== e.target.options.key;
                  });
                  filterFeats.push(editedLayer);
                  this.props.onShapeChange(filterFeats);
                  this.setState({ features: filterFeats });
                }
              });
            });

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
          savedFeature.addTo(this.state.mapState)
        }
      }
      )
    } 
  }
  render() {
    const mapid = `mapid${!this.props.mapCount ? '' : ` ${this.props.mapCount.toString()}`}`
    return (<div id={mapid} className='mapbox' />);
  }
}

Map.defaultProps = {
  onShapeChange: noop,
  apiKey: "",
  cutMode: false,
  editable: true,
  center: [38.194706, -85.71053],
  markerHtml:
    '<svg width="8" height="8" version="1.1" xmlns="http://www.w3.org/2000/svg"> <circle cx="4" cy="4" r="4" stroke="red" fill="red" stroke-width="0" /></svg>',
  searchProvider: 'google',
  hideSearch: false,
  tileProvider: 'OpenStreetMap.Mapnik'
};

export default Map;
