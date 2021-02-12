import { GeoJSON } from 'geojson';
import * as React from 'react';

type ToolTipType = {
    comp: string;
    func: () => void
    tooltip: string;
    values: Array<string>
}

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
type BoundZoomType = {
    bounds: LatType
    zoom: number
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

export interface MapProps {
    tileProvider: string;
    editable: boolean;
    cutMode?: boolean;
    onShapeChange: (feature?: GeoJSON) => void;
    features: Array<GeoJSON> | [];
    searchProvider?: string;
    apiKey?: string;
    center?: Array<number>;
    markerHtml?: string;
    mapCount?: number;
    getBounding?: (data?: BoundZoomType) => void;
    providerResults?: (data: ResultType[] | []) => void;
    providerInput?: string;
    hideSearch?: boolean
    geoLocate?: ResultType[];
    tooltipContent?: ToolTipType;

}
declare class Map extends React.Component<MapProps, any> {}
export default Map
