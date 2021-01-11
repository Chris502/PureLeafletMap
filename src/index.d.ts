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
        getBounding?: () => Array<LatType>;
}
declare const Map: React.Component<MapProps>
export default Map
