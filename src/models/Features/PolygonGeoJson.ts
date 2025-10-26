import EntrancePointGeoJson from './EntrancePointGeoJson';

export default interface PolygonGeoJson extends GeoJSON.Feature<GeoJSON.Polygon> {
  properties: {
    layerId? :number;
    id: string;
    floor: number;
    name?: string;
    iconSource?: string;
    entrance?: EntrancePointGeoJson;
    popupContent?: string;
  };
}
