import { Feature, Geometry } from 'geojson';
import * as L from 'leaflet';

export default interface CustomLayer extends L.Layer {
    toGeoJSON?: () => Feature<Geometry>;

    customProperties?: {
        floor: number;
        typeOfData: string; //"polyline" | "polygon" |"marker" | "circlemarker";
        id: string;
    };
}