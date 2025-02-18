import { Position } from "geojson";

export default interface Route {
  id: string,
  path: Position[],
  floor: number
}