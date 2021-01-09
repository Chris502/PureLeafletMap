import { GeoJSON } from 'geojson';
import React from 'react';

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
}
declare const Map: React.Component<MapProps>
export default Map