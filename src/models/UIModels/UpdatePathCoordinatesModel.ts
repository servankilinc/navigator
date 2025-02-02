import { Position } from "geojson";


export default interface UpdatePathCoordinatesModel {
    pathId: string;
    coordinates: Position[];
}
