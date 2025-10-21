import { AdvancedPointDirectionTypesEnums } from "../AdvancedPointDirectionTypes";
import AdvancedPointTypes from "../AdvancedPointTypes";

export default interface AdvancedPointGeoJson extends GeoJSON.Feature<GeoJSON.Point> {
  properties: {
    layerId?: number,
    id: string;
    groupId: string;
    type?: AdvancedPointTypes,
    directionType?: AdvancedPointDirectionTypesEnums,
    floor: number;
    name?: string;
    popupContent?: string;
  };
}