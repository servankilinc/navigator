import { AdvancedPointDirectionTypesEnums } from "../UIModels/AdvancedPointDirectionTypes";
import AdvancedPointTypes from "../UIModels/AdvancedPointTypes";

export default interface AdvancedPointGeoJson extends GeoJSON.Feature<GeoJSON.Point> {
  properties: {
    layerId?: number,
    id: string;
    type?: AdvancedPointTypes,
    directionType?: AdvancedPointDirectionTypesEnums,
    floor: number;
    name?: string;
    popupContent?: string;
  };
}