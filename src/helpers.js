import L from "leaflet";
import flatten from "lodash.flatten";
import max from "lodash.max";
import geojsonArea from "geojson-area";
import map from "lodash.map";
import min from "lodash.min";

export const getCoords = arr => {
  if (!arr || !arr.length) return [];
  if (arr.length === 2 && typeof arr[1] === "number") return [arr];
  if (arr[0].length && typeof arr[0][1] === "number") return arr;
  if (arr[0][0].length && typeof arr[0][0][1] === "number")
    return getCoords(flatten(arr));
  if (arr[0][0][0].length && typeof arr[0][0][0][1] === "number")
    return getCoords(flatten(arr));
  return arr;
};

export const getBounds = (polygons, points) => {
  if (polygons.length === 0 && points.length === 0) return [35, -83];
  let coords = [];
  map(polygons, poly => {
    coords = coords.concat(getCoords(poly.geometry.coordinates));
  });
  const lats = [];
  const longs = [];
  map(coords, coord => {
    lats.push(coord[1]);
    longs.push(coord[0]);
  });
  const c1 = L.latLng(max(lats), max(longs));
  const c2 = L.latLng(min(lats), min(longs));
  return L.latLngBounds(c1, c2);
};

export const addArea = featObj => {
  const { geometry } = featObj;
  const area = geojsonArea.geometry(geometry);
  const x = area / 2590000;
  return Number.parseFloat(x).toFixed(4);
};
