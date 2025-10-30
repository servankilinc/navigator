export default interface ThreeDModelPointGeoJson extends GeoJSON.Feature<GeoJSON.Point> {
  properties: {
    layerId?: number;
    id: string;
    floor: number;
    name?: string;
    source: string;
    scaleRate: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
  };
}
