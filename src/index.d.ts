import { GeoJSON } from 'geojson';
import React from 'react';

type LatType = {
        northeast: {
                lat: Number
                lng: Number
        },
        southwest: {
                lat: Number
                lng: Number
        }
}
type RawType = {
        boundingbox: string[]
        class: string
        display_name: string
        importance: number
        lat: string
        license: string
        lon: string
        osm_id: number
        osm_type: string
        place_id: number
        type: string
}
type ResultType = {
        x: string // lon,
        y: string // lat,
        label: string // formatted address
        bounds: string[][]
        raw: RawType // raw provider result
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
        providerResults?: (data: ResultType[] | []) => void;
        providerInput?: string;
        hideSearch?: boolean;
}
declare const Map: React.Component<MapProps>
export default Map
