import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import e7 from '../../scripts/idGenerator';
import Floor from '../../models/Floor';
import Graph from '../../models/Graph';
import PolygonGeoJson from '../../models/Features/PolygonGeoJson';
import LineStringGeoJson from '../../models/Features/LineStringGeoJson';
import EntrancePointGeoJson from '../../models/Features/EntrancePointGeoJson';
import AdvancedPointGeoJson from '../../models/Features/AdvancedPointGeoJson';
import UpdateAdvancedPointInfoModel from '../../models/UIModels/UpdateAdvancedPointInfoModel';
import { AdvancedPointDirectionTypesEnums } from '../../models/AdvancedPointDirectionTypes';
import IntersectionPoint from '../../models/IntersectionPoint';
import Route from '../../models/Route';
import { Position } from 'geojson';

interface StateUI {
  floorList: Floor[];
  graphList: Graph[];
  polygons: PolygonGeoJson[];
  paths: LineStringGeoJson[];
  intersectionPoints: IntersectionPoint[];
  entrancePoints: EntrancePointGeoJson[];
  advancedPoints: AdvancedPointGeoJson[];
  routeList: Route[];
}

const initialState: StateUI = {
  floorList: [],
  graphList: [],
  polygons: [],
  paths: [],
  intersectionPoints: [],
  entrancePoints: [],
  advancedPoints: [],
  routeList: [],
};

export const storageSlice = createSlice({
  name: 'storageSlice',
  initialState,
  reducers: {
    addFloor: (state, action: PayloadAction<Floor>) => {
      state.floorList = [...state.floorList, action.payload];
      state.floorList.sort((a, b) => b.index - a.index);
    },
    addGraph: (state, action: PayloadAction<Graph>) => {
      state.graphList = [...state.graphList, action.payload];
    },
    addPolygon: (state, action: PayloadAction<PolygonGeoJson>) => {
      state.polygons = [...state.polygons, action.payload];
    },
    addPath: (state, action: PayloadAction<LineStringGeoJson>) => {
      state.paths = [...state.paths, action.payload];
    },
    addEntrancePoint: (state, action: PayloadAction<EntrancePointGeoJson>) => {
      state.entrancePoints = [...state.entrancePoints, action.payload];
    },
    addAdvancedPoint: (state, action: PayloadAction<AdvancedPointGeoJson>) => {
      state.advancedPoints = [...state.advancedPoints, action.payload];
    },
    addRoute: (state, action: PayloadAction<Route>) => {
      state.routeList = [...state.routeList, action.payload];
    },
    addIntersectionPoint: (state, action: PayloadAction<IntersectionPoint>) => {
      state.intersectionPoints = [...state.intersectionPoints, action.payload];
    },

    setFloorList: (state, action: PayloadAction<Floor[]>) => {
      state.floorList = [...action.payload];
      state.floorList.sort((a, b) => b.index - a.index);
    },
    setGraphList: (state, action: PayloadAction<Graph[]>) => {
      state.graphList = [...action.payload];
    },
    setPolygonList: (state, action: PayloadAction<PolygonGeoJson[]>) => {
      state.polygons = [...action.payload];
    },
    setPathList: (state, action: PayloadAction<LineStringGeoJson[]>) => {
      state.paths = [...action.payload];
    },
    setEntrancePointList: (state, action: PayloadAction<EntrancePointGeoJson[]>) => {
      state.entrancePoints = [...action.payload];
    },
    setAdvancedPointList: (state, action: PayloadAction<AdvancedPointGeoJson[]>) => {
      state.advancedPoints = [...action.payload];
    },
    setIntersectionPointList: (state, action: PayloadAction<IntersectionPoint[]>) => {
      state.intersectionPoints = [...action.payload];
    },
    setRouteList: (state, action: PayloadAction<Route[]>) => {
      state.routeList = [...action.payload];
    },

    removeFloor: (state, action: PayloadAction<{ floorIndex: number }>) => {
      state.floorList = state.floorList.filter((floor) => floor.index !== action.payload.floorIndex);
      state.graphList = state.graphList.filter((graph) => graph.floor !== action.payload.floorIndex);
      state.polygons = state.polygons.filter((polygon) => polygon.properties.floor !== action.payload.floorIndex);
      state.paths = state.paths.filter((path) => path.properties.floor !== action.payload.floorIndex);
      state.entrancePoints = state.entrancePoints.filter((ep) => ep.properties.floor !== action.payload.floorIndex);
      state.advancedPoints = state.advancedPoints.filter((ap) => ap.properties.floor !== action.payload.floorIndex);
    },
    removePolygon: (state, action: PayloadAction<string>) => {
      state.polygons = state.polygons.filter((polygon) => polygon.properties.id !== action.payload);
    },
    removePath: (state, action: PayloadAction<string>) => {
      state.paths = state.paths.filter((path) => path.properties.id !== action.payload);
    },
    removeEntrancePoint: (state, action: PayloadAction<string>) => {
      state.entrancePoints = state.entrancePoints.filter((ep) => ep.properties.id !== action.payload);
    },
    removeAdvancedPoint: (state, action: PayloadAction<string>) => {
      state.advancedPoints = state.advancedPoints.filter((ap) => ap.properties.id !== action.payload);
    },

    clearIntersectionPoints: (state) => {
      state.intersectionPoints = [];
    },
    clearRoutes: (state) => {
      state.routeList = [];
    },

    setEntrancePoinOfPolygon: (state, action: PayloadAction<EntrancePointGeoJson>) => {
      const index = state.polygons.findIndex((p) => p.properties.id === action.payload.properties.polygonId);

      if (index !== -1 && state.polygons[index]) {
        state.polygons[index].properties = {
          ...state.polygons[index].properties,
          entrance: action.payload,
        };
      }
    },

    setEntrancePointCordsOfPolygon: (state, action: PayloadAction<{ id: string; coordinates: Position }>) => {
      const index = state.polygons.findIndex((p) => p.properties.id === action.payload.id);

      if (index !== -1 && state.polygons[index]) {
        state.polygons[index].properties.entrance!.geometry! = {
          ...state.polygons[index].properties.entrance!.geometry!,
          coordinates: action.payload.coordinates,
        };
      }
    },

    setPolygonInfo: (state, action: PayloadAction<{ polygonId: string; name: string; popupContent: string; iconSource: string | undefined }>) => {
      const index = state.polygons.findIndex((p) => p.properties.id === action.payload.polygonId);
      if (index !== -1) {
        state.polygons[index] = {
          ...state.polygons[index],
          properties: {
            ...state.polygons[index].properties,
            name: action.payload.name,
            popupContent: action.payload.popupContent,
            iconSource: action.payload.iconSource,
          },
        };
      }
    },

    setPolygonCoordinates: (state, action: PayloadAction<{ polygonId: string; coordinates: Position[][] }>) => {
      const index = state.polygons.findIndex((p) => p.properties.id === action.payload.polygonId);
      if (index !== -1) {
        state.polygons[index] = {
          ...state.polygons[index],
          geometry: {
            ...state.polygons[index].geometry,
            coordinates: action.payload.coordinates,
          },
        };
      }
    },

    setPathCoordinates: (state, action: PayloadAction<{ pathId: string; coordinates: Position[] }>) => {
      const index = state.paths.findIndex((p) => p.properties.id === action.payload.pathId);
      if (index !== -1) {
        state.paths[index] = {
          ...state.paths[index],
          geometry: {
            ...state.paths[index].geometry,
            coordinates: action.payload.coordinates,
          },
        };
      }
    },

    setIntersectionPointCoordinate: (state, action: PayloadAction<{ id: string; coordinate: number[] }>) => {
      const index = state.intersectionPoints.findIndex((ip) => ip.id === action.payload.id);
      if (index !== -1) {
        state.intersectionPoints[index] = {
          ...state.intersectionPoints[index],
          coordinate: action.payload.coordinate,
          isChanged: true,
        };
      }
    },

    setEntrancePointCoordinates: (state, action: PayloadAction<{ id: string; coordinates: Position }>) => {
      const index = state.entrancePoints.findIndex((p) => p.properties.id === action.payload.id);
      if (index !== -1) {
        state.entrancePoints[index] = {
          ...state.entrancePoints[index],
          geometry: {
            ...state.entrancePoints[index].geometry,
            coordinates: action.payload.coordinates,
          },
        };
      }
    },

    setAdvancedPointCoordinates: (state, action: PayloadAction<{ id: string; coordinates: Position }>) => {
      const index = state.advancedPoints.findIndex((p) => p.properties.id === action.payload.id);
      if (index !== -1) {
        state.advancedPoints[index] = {
          ...state.advancedPoints[index],
          geometry: {
            ...state.advancedPoints[index].geometry,
            coordinates: action.payload.coordinates,
          },
        };
      }
    },

    setAdvancedPointInfo: (state, action: PayloadAction<UpdateAdvancedPointInfoModel>) => {
      const index = state.advancedPoints.findIndex((p) => p.properties.id === action.payload.id);
      if (index !== -1) {
        const targetFloorList = action.payload.targetFloorList;
        const relatedAPoint = state.advancedPoints[index];
        // bu kayıt seçili olan bütün katlara eklenemli
        const tempArray: AdvancedPointGeoJson[] = [];
        for (let index_f = 0; index_f < targetFloorList.length; index_f++) {
          const _floorIndex = targetFloorList[index_f];
          tempArray.push({
            ...relatedAPoint,
            properties: {
              ...relatedAPoint.properties,
              id: e7(),
              groupId: action.payload.id,
              floor: _floorIndex,
              name: action.payload.name,
              type: action.payload.type,
              directionType: !targetFloorList.some((f) => f > _floorIndex)
                ? AdvancedPointDirectionTypesEnums.down
                : !targetFloorList.some((f) => f < _floorIndex)
                ? AdvancedPointDirectionTypesEnums.up
                : AdvancedPointDirectionTypesEnums.twoWay,
            },
          });
        }
        // kat bilgisi 404 olan henüz bilgi girilmemiş gelişmiş noktayı silelim
        state.advancedPoints = [...state.advancedPoints.filter((ap) => ap.properties.id !== action.payload.id), ...tempArray];
      }
    },

    splicePathCoordinates: (state, action: PayloadAction<{ prevIndex: number; pathId: string; coordinate: Position }>) => {
      const index = state.paths.findIndex((p) => p.properties.id === action.payload.pathId);
      if (index == -1) return;

      const tempCords = [...state.paths[index].geometry.coordinates];
      tempCords.splice(action.payload.prevIndex, 0, action.payload.coordinate);

      state.paths[index] = {
        ...state.paths[index],
        geometry: {
          ...state.paths[index].geometry,
          coordinates: tempCords,
        },
      };
    },

    trimPathCoordinates: (state, action: PayloadAction<{ prevIndex: number; pathId: string }>) => {
      const index = state.paths.findIndex((p) => p.properties.id === action.payload.pathId);
      if (index == -1) return;

      const tempCords = [...state.paths[index].geometry.coordinates];
      tempCords.splice(action.payload.prevIndex, 1);

      // yolla ait bir segment kalmadı o zaman silinmeli
      if (tempCords.length <= 1) {
        state.paths = state.paths.filter((path) => path.properties.id !== action.payload.pathId);
      } else {
        state.paths[index] = {
          ...state.paths[index],
          geometry: {
            ...state.paths[index].geometry,
            coordinates: tempCords,
          },
        };
      }
    },
  },
});

export const {
  addFloor,
  addGraph,
  addPolygon,
  addPath,
  addEntrancePoint,
  addAdvancedPoint,
  addIntersectionPoint,
  addRoute,

  setFloorList,
  setGraphList,
  setPolygonList,
  setPathList,
  setEntrancePointList,
  setAdvancedPointList,
  setIntersectionPointList,
  setRouteList,

  removeFloor,
  removePolygon,
  removePath,
  removeEntrancePoint,
  removeAdvancedPoint,

  clearIntersectionPoints,
  clearRoutes,

  setEntrancePoinOfPolygon,
  setEntrancePointCordsOfPolygon,
  setPolygonInfo,
  setPolygonCoordinates,
  setPathCoordinates,
  setIntersectionPointCoordinate,
  setEntrancePointCoordinates,
  setAdvancedPointCoordinates,
  setAdvancedPointInfo,
  splicePathCoordinates,
  trimPathCoordinates,
} = storageSlice.actions;

export default storageSlice.reducer;
