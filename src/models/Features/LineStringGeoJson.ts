export default interface LineStringGeoJson extends GeoJSON.Feature<GeoJSON.LineString> {
  properties: {
    layerId?: number,
    id: string;
    floor: number;
    name?: string;
    popupContent?: string;
  };
}
