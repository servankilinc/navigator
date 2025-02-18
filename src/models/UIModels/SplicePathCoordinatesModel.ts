import { Position } from 'geojson';

export interface SplicePathCoordinatesModel {
  prevIndex: number;
  pathId: string;
  coordinate: Position;
}
