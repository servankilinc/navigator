import { Position } from 'geojson';

export default interface SetPathCoordinateLatLngModel {
  latLngIndex: number; //0 | 1;
  pathId: string;
  coordinate: Position;
}
