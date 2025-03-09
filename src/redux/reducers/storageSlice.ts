import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import e7 from '../../scripts/idGenerator';
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
import { AdvancedPointDirectionTypesEnums } from '../../models/UIModels/AdvancedPointDirectionTypes';
import DesignGraphListModel from '../../models/UIModels/DesignGraphListModel';
import { SplicePathCoordinatesModel } from '../../models/UIModels/SplicePathCoordinatesModel';
import SetPathCoordinateLatLngModel from '../../models/UIModels/SetPathCoordinateLatLngModel';
import Route from '../../models/Route';

interface StateUI {
  floorList: Floor[];
  graphList: Graph[];
  polygons: PolygonGeoJson[];
  paths: LineStringGeoJson[];
  routeList: Route[];
  entrancePoints: EntrancePointGeoJson[];
  advancedPoints: AdvancedPointGeoJson[];
}

const initialState: StateUI = {
  floorList: [],
  graphList: [],
  polygons: [],
  paths: [],
  routeList: [],
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
    addRoute: (state, action: PayloadAction<Route>) => {
      state.routeList = [...state.routeList, action.payload];
    },
    addEntrancePoint: (state, action: PayloadAction<EntrancePointGeoJson>) => {
      state.entrancePoints = [...state.entrancePoints, action.payload];
    },
    addAdvancedPoint: (state, action: PayloadAction<AdvancedPointGeoJson>) => {
      state.advancedPoints = [...state.advancedPoints, action.payload];
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
    setRouteList: (state, action: PayloadAction<Route[]>) => {
      state.routeList = [...action.payload];
    },
    setEntrancePointList: (state, action: PayloadAction<EntrancePointGeoJson[]>) => {
      state.entrancePoints = [...action.payload];
    },
    setAdvancedPointList: (state, action: PayloadAction<AdvancedPointGeoJson[]>) => {
      state.advancedPoints = [...action.payload];
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

    clearRoutes: (state) => {
      state.routeList = [];
    },

    
    setRoutes: (state, action: PayloadAction<Route[]>) => {
      state.routeList = [...action.payload];
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
        state.polygons[index] = {
          ...state.polygons[index],
          properties: {
            ...state.polygons[index].properties,
            name: action.payload.propertiesName,
            popupContent: action.payload.propertiesPopupContent,
          },
        };
      }
    },

    setPolygonCoordinates: (state, action: PayloadAction<UpdatePolygonCoordinatesModel>) => {
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

    setPathCoordinates: (state, action: PayloadAction<UpdatePathCoordinatesModel>) => {
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

    splicePathCoordinates: (state, action: PayloadAction<SplicePathCoordinatesModel>) => {
      const index = state.paths.findIndex((p) => p.properties.id === action.payload.pathId);
      if(index == -1) return;

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

    setPathCoordinateLatLng: (state, action: PayloadAction<SetPathCoordinateLatLngModel>) => {
      const index = state.paths.findIndex((p) => p.properties.id === action.payload.pathId);
      if (index == -1) return;

      const tempCords = [...state.paths[index].geometry.coordinates];
      tempCords[action.payload.latLngIndex] = action.payload.coordinate;
      state.paths[index] = {
        ...state.paths[index],
        geometry: {
          ...state.paths[index].geometry,
          coordinates: tempCords
        },
      };
    },

    setEntrancePointCoordinates: (state, action: PayloadAction<UpdatePointCoordinatesModel>) => {
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

    setAdvancedPointCoordinates: (state, action: PayloadAction<UpdatePointCoordinatesModel>) => {
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
              directionType: !targetFloorList.some(f => f > _floorIndex) ? AdvancedPointDirectionTypesEnums.down : 
                             !targetFloorList.some(f => f < _floorIndex) ? AdvancedPointDirectionTypesEnums.up : AdvancedPointDirectionTypesEnums.twoWay,
            },
          });
        }
        // kat bilgisi 404 olan henüz bilgi girilmemiş gelişmiş noktayı silelim 
        state.advancedPoints = [
          ...state.advancedPoints.filter((ap) => ap.properties.id !== action.payload.id), ...tempArray
        ];
      }
    },
 
    
    designGraphList: (state, action: PayloadAction<DesignGraphListModel>) => {
      console.log("before design dispatch", state.graphList)
      state.graphList = state.graphList.map((graphData) =>{
        var newFloorGraphData = action.payload.updateModels.find(f => f.floor == graphData.floor);
        if (newFloorGraphData == null) return { ...graphData };
        return { ...graphData, nodes: [...newFloorGraphData.nodes], edges: [...newFloorGraphData.edges], graphGraphLib: newFloorGraphData.gGraph };
      });
      console.log("after design dispatch", state.graphList)
    }
  },
});

export const {
  addFloor,
  addGraph,
  addPolygon,
  addPath,
  addRoute,
  addEntrancePoint,
  addAdvancedPoint,
  setFloorList,
  setGraphList,
  setPolygonList,
  setPathList,
  setRouteList,
  setEntrancePointList,
  setAdvancedPointList,
  removePolygon,
  removePath,
  removeEntrancePoint,
  removeAdvancedPoint,
  clearRoutes,
  setRoutes,
  setEntrancePoinOfPolygon,
  setEntrancePointCordsOfPolygon,
  setPolygonInfo,
  setPolygonCoordinates,
  setPathCoordinates,
  splicePathCoordinates,
  setPathCoordinateLatLng,
  setEntrancePointCoordinates,
  setAdvancedPointCoordinates,
  setAdvancedPointInfo,
  designGraphList,
} = storageSlice.actions;

export default storageSlice.reducer;
