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
import AddNodeToGraphModel from '../../models/UIModels/AddNodeToGraphModel';
import AddEdgeToGraphModel from '../../models/UIModels/AddEdgeToGraphModel';
import UpdateGraphLibToGraphModel from '../../models/UIModels/UpdateGraphLibToGraphModel';
import { Graph as gGraph } from 'graphlib';
import { AddNodeListToGraphModel } from '../../models/UIModels/AddNodeListToGraphModel';
import { AddEdgeListToGraphModel } from '../../models/UIModels/AddEdgeListToGraphModel';
import { AdvancedPointDirectionTypesEnums } from '../../models/UIModels/AdvancedPointDirectionTypes';
import e7 from '../../scripts/idGenerator';

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
  polygons: [
    {
        "type": "Feature",
        "properties": {
            "layerId": 130,
            "id": "2d2170e4-ecbd-413e-a6d6-e1c9072d1e74",
            "floor": 0,
            "name": "Bina 1",
            "popupContent": "Bina Bilgisi, İsim: Bina Kat:0 ID:2d2170e4-ecbd-413e-a6d6-e1c9072d1e74",
            "entrance": {
                "type": "Feature",
                "properties": {
                    "layerId": 140,
                    "id": "3c8aaaa3-07fd-4f53-bfe5-13f046943c80",
                    "floor": 0,
                    "name": "Bina Girisi",
                    "isEntrance": true,
                    "polygonId": "2d2170e4-ecbd-413e-a6d6-e1c9072d1e74"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        33.086256,
                        39.090876
                    ]
                }
            }
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        33.086449,
                        39.091192
                    ],
                    [
                        33.086138,
                        39.090942
                    ],
                    [
                        33.08646,
                        39.090809
                    ],
                    [
                        33.086835,
                        39.091142
                    ],
                    [
                        33.086449,
                        39.091192
                    ]
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "layerId": 158,
            "id": "553321db-0b21-4edd-a6dd-70b545eee04a",
            "floor": 0,
            "name": "Bina 2",
            "popupContent": "Bina Bilgisi, İsim: Bina Kat:0 ID:553321db-0b21-4edd-a6dd-70b545eee04a",
            "entrance": {
                "type": "Feature",
                "properties": {
                    "layerId": 166,
                    "id": "56c53654-4e88-4839-a379-b3df80077d26",
                    "floor": 0,
                    "name": "Bina Girisi",
                    "isEntrance": true,
                    "polygonId": "553321db-0b21-4edd-a6dd-70b545eee04a"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        33.085913,
                        39.089627
                    ]
                }
            }
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        33.085516,
                        39.089543
                    ],
                    [
                        33.085516,
                        39.089785
                    ],
                    [
                        33.085827,
                        39.089826
                    ],
                    [
                        33.08588,
                        39.089502
                    ],
                    [
                        33.085516,
                        39.089543
                    ]
                ]
            ]
        }
    }
],
  paths: [
    {
        "type": "Feature",
        "properties": {
            "layerId": 178,
            "id": "54279253-d3f3-4b9f-b922-4691b9a89f53",
            "floor": 0,
            "name": "Yol",
            "popupContent": "Yol Bilgisi, Kat:0 ID:54279253-d3f3-4b9f-b922-4691b9a89f53"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [
                    33.086234,
                    39.090817
                ],
                [
                    33.088144,
                    39.08921
                ]
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "layerId": 192,
            "id": "e9eec8b7-3307-4f7e-869d-890a7202824d",
            "floor": 0,
            "name": "Yol",
            "popupContent": "Yol Bilgisi, Kat:0 ID:e9eec8b7-3307-4f7e-869d-890a7202824d"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [
                    33.086052,
                    39.089668
                ],
                [
                    33.087629,
                    39.090476
                ]
            ]
        }
    }
],
  entrancePoints: [
    {
        "type": "Feature",
        "properties": {
            "layerId": 140,
            "id": "3c8aaaa3-07fd-4f53-bfe5-13f046943c80",
            "floor": 0,
            "name": "Bina Girisi",
            "isEntrance": true,
            "polygonId": "2d2170e4-ecbd-413e-a6d6-e1c9072d1e74"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                33.086256,
                39.090876
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "layerId": 166,
            "id": "56c53654-4e88-4839-a379-b3df80077d26",
            "floor": 0,
            "name": "Bina Girisi",
            "isEntrance": true,
            "polygonId": "553321db-0b21-4edd-a6dd-70b545eee04a"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                33.085913,
                39.089627
            ]
        }
    }
],
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

    addNodeToGraph: (state, action: PayloadAction<AddNodeToGraphModel>) => {
      state.graphList = state.graphList.map((graphData) =>
        graphData.floor == action.payload.floor ? { ...graphData, nodes: [...graphData.nodes, action.payload.node] } : graphData
      );
    },

    setNodeListToGraph: (state, action: PayloadAction<AddNodeListToGraphModel>) => {
      state.graphList = state.graphList.map((graphData) =>
        graphData.floor == action.payload.floor ? { ...graphData, nodes: [...action.payload.nodes] } : graphData
      );
    },
    
    addEdgeToGraph: (state, action: PayloadAction<AddEdgeToGraphModel>) => {
      state.graphList = state.graphList.map((graphData) =>
        graphData.floor == action.payload.floor ? { ...graphData, edges: [...graphData.edges, action.payload.edge] } : graphData
      );
    },

    setEdgeListToGraph: (state, action: PayloadAction<AddEdgeListToGraphModel>) => {
      state.graphList = state.graphList.map((graphData) =>
        graphData.floor == action.payload.floor ? { ...graphData, edges: [...action.payload.edges] } : graphData
      );
    },

    setgGraphToGraph: (state, action: PayloadAction<UpdateGraphLibToGraphModel>) => {
      state.graphList = state.graphList.map((graphData) =>
        graphData.floor === action.payload.floor ? { ...graphData, graphGraphLib: action.payload.graph } : graphData
      );
    },

    clearGraphByFloor: (state, action: PayloadAction<number>) => {
      state.graphList = state.graphList.map((graphData) =>
        graphData.floor === action.payload ? { ...graphData, edges: [], nodes: [], graphGraphLib: new gGraph() } : graphData
      );
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
  setAdvancedPointInfo,
  addNodeToGraph,
  setNodeListToGraph,
  addEdgeToGraph,
  setEdgeListToGraph,
  setgGraphToGraph,
  clearGraphByFloor
} = storageSlice.actions;

export default storageSlice.reducer;
