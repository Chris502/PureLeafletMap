import { GeoJSON } from 'geojson';
import * as React from 'react';

export interface MapProps {
    editable: boolean;
    cutMode?: boolean;
    onShapeChange: (feature?: GeoJSON) => void;
    features: Array<GeoJSON> | [];
    searchProvider?: string;
    apiKey?: string;
    center?: Array<number>;
    markerHtml?: string;
    mapCount?: number;
}
declare class Map extends React.Component<MapProps, any> {}
export default Map
