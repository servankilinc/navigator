import AdvancedPointTypes from "./AdvancedPointTypes";

export default interface UpdateAdvancedPointInfoModel{
  id: string,
  name: string,
  type: AdvancedPointTypes,
  // directionType: AdvancedPointDirectionTypesEnums,
  targetFloorList: number[]
}