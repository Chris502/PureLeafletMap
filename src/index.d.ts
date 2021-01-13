import { GeoJSON } from 'geojson';
import React from 'react';

type LatType = {
        northeast: {
                lat: Number,
                lng: Number,
        },
        southwest: {
                lat: Number,
                lng: Number,
        }
}
type ResultType = {
        x: Number, // lon,
        y: Number, // lat,
        label: String, // formatted address
        bounds: [
                [Number, Number], // s, w - lat, lon
                [Number, Number], // n, e - lat, lon
        ],
        raw: {}, // raw provider result
};
export interface MapProps<> {
        editable: boolean;
        cutMode?: boolean;
        onShapeChange: (feature: GeoJSON) => Array<GeoJSON>;
        features: Array<GeoJSON> | [];
        searchProvider?: string;
        apiKey?: string;
        center: Array<number>;
        markerHtml: string;
        mapCount: number;
        getBounding?: (data?: LatType) => void;
        providerResults?: (data: ResultType[]) => void;
        providerInput?: string;
}
declare const Map: React.Component<MapProps>
export default Map
