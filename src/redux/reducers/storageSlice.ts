import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Floor from '../../models/Floor';
import Graph from '../../models/Graph';
import PolygonGeoJson from '../../models/Features/PolygonGeoJson';
import LineStringGeoJson from '../../models/Features/LineStringGeoJson';
import EntrancePointGeoJson from '../../models/Features/EntrancePointGeoJson';
import AdvancedPointGeoJson from '../../models/Features/AdvancedPointGeoJson';
import UpdatePolygonInfoModel from '../../models/UIModels/UpdatePolygonInfoModel';
import UpdatePolygonCoordinatesModel from '../../models/UIModels/UpdatePolygonCoordinatesModel';
import { UpdatePointCoordinatesModel } from '../../models/UIModels/UpdatePointCoordinatesModel';
import UpdatePathCoordinatesModel from '../../models/UIModels/UpdatePathCoordinatesModel';
import UpdateAdvancedPointInfoModel from '../../models/UIModels/UpdateAdvancedPointInfoModel';

interface StateUI {
  floorList: Floor[];
  graphList: Graph[];
  polygons: PolygonGeoJson[];
  paths: LineStringGeoJson[];
  entrancePoints: EntrancePointGeoJson[];
  advancedPoints: AdvancedPointGeoJson[];
}

const initialState: StateUI = {
  floorList: [],
  graphList: [],
  polygons: [],
  paths: [],
  entrancePoints: [],
  advancedPoints: [],
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

    updateFloor: (state, action: PayloadAction<Floor>) => {
      state.floorList = state.floorList.map((floor) => (floor.index === action.payload.index ? action.payload : floor));
    },
    updateGraph: (state, action: PayloadAction<Graph>) => {
      state.graphList = state.graphList.map((graph) => (graph.floor === action.payload.floor ? action.payload : graph));
    },
    updatePolygon: (state, action: PayloadAction<PolygonGeoJson>) => {
      state.polygons = state.polygons.map((polygon) => (polygon.properties.id === action.payload.properties.id ? action.payload : polygon));
    },
    updatePath: (state, action: PayloadAction<LineStringGeoJson>) => {
      state.paths = state.paths.map((path) => (path.properties.id === action.payload.properties.id ? action.payload : path));
    },
    updateEntrancePoint: (state, action: PayloadAction<EntrancePointGeoJson>) => {
      state.entrancePoints = state.entrancePoints.map((ep) => (ep.properties.id === action.payload.properties.id ? action.payload : ep));
    },
    updateAdvancedPoint: (state, action: PayloadAction<AdvancedPointGeoJson>) => {
      state.advancedPoints = state.advancedPoints.map((ap) => (ap.properties.id === action.payload.properties.id ? action.payload : ap));
    },

    removeFloor: (state, action: PayloadAction<string>) => {
      state.floorList = state.floorList.filter((floor) => floor.id !== action.payload);
    },
    removeGraph: (state, action: PayloadAction<number>) => {
      state.graphList = state.graphList.filter((graph) => graph.floor !== action.payload);
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

    setEntrancePoinOfPolygon: (state, action: PayloadAction<EntrancePointGeoJson>) => {
      const index = state.polygons.findIndex((p) => p.properties.id === action.payload.properties.polygonId);

      if (index !== -1 && state.polygons[index]) {
        state.polygons[index].properties = {
          ...state.polygons[index].properties,
          entrance: action.payload,
        };
      }
    },

    setEntrancePointCordsOfPolygon: (state, action: PayloadAction<UpdatePointCoordinatesModel>) => {
      const index = state.polygons.findIndex((p) => p.properties.id === action.payload.id);

      if (index !== -1 && state.polygons[index]) {
        state.polygons[index].properties.entrance!.geometry! = {
          ...state.polygons[index].properties.entrance!.geometry!,
          coordinates: action.payload.coordinates,
        };
      }
    },

    setPolygonInfo: (state, action: PayloadAction<UpdatePolygonInfoModel>) => {
      const index = state.polygons.findIndex((p) => p.properties.id === action.payload.polygonId);
      if (index !== -1) {
        state.polygons[index].properties.name = action.payload.propertiesName;
        state.polygons[index].properties.popupContent = action.payload.propertiesPopupContent;
      }
    },

    setPolygonCoordinates: (state, action: PayloadAction<UpdatePolygonCoordinatesModel>) => {
      const index = state.polygons.findIndex((p) => p.properties.id === action.payload.polygonId);
      if (index !== -1) {
        state.polygons[index].geometry.coordinates = action.payload.coordinates;
      }
    },

    setPathCoordinates: (state, action: PayloadAction<UpdatePathCoordinatesModel>) => {
      const index = state.paths.findIndex((p) => p.properties.id === action.payload.pathId);
      if (index !== -1) {
        state.paths[index].geometry.coordinates = action.payload.coordinates;
      }
    },

    setEntrancePointCoordinates: (state, action: PayloadAction<UpdatePointCoordinatesModel>) => {
      const index = state.entrancePoints.findIndex((p) => p.properties.id === action.payload.id);
      if (index !== -1) {
        state.entrancePoints[index].geometry.coordinates = action.payload.coordinates;
      }
    },

    setAdvancedPointCoordinates: (state, action: PayloadAction<UpdatePointCoordinatesModel>) => {
      const index = state.advancedPoints.findIndex((p) => p.properties.id === action.payload.id);
      if (index !== -1) {
        state.advancedPoints[index].geometry.coordinates = action.payload.coordinates;
      }
    },

    setAdvancedPointInfo: (state, action: PayloadAction<UpdateAdvancedPointInfoModel>) => {
      const index = state.advancedPoints.findIndex((p) => p.properties.id === action.payload.id);
      if (index !== -1) {
        state.advancedPoints[index].properties.name = action.payload.name;
        state.advancedPoints[index].properties.type = action.payload.type;
        state.advancedPoints[index].properties.directionType = action.payload.directionType;
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
  updateFloor,
  updateGraph,
  updatePolygon,
  updatePath,
  updateEntrancePoint,
  updateAdvancedPoint,
  removeFloor,
  removeGraph,
  removePolygon,
  removePath,
  removeEntrancePoint,
  removeAdvancedPoint,
  setEntrancePoinOfPolygon,
  setEntrancePointCordsOfPolygon,
  setPolygonInfo,
  setPolygonCoordinates,
  setPathCoordinates,
  setEntrancePointCoordinates,
  setAdvancedPointCoordinates,
  setAdvancedPointInfo
} = storageSlice.actions;

export default storageSlice.reducer;
