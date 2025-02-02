export default interface EntrancePointGeoJson extends GeoJSON.Feature<GeoJSON.Point> {
  properties: {
    layerId?: number,
    id: string;
    floor: number;
    name?: string;
    popupContent?: string;
    isEntrance?: boolean;
    polygonId?: string;
  };
}