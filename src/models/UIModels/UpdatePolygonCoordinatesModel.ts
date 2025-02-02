import { Position } from "geojson";

export default interface UpdatePolygonCoordinatesModel {
    polygonId: string;
    coordinates: Position[][];
}