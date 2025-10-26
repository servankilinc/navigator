import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as L from 'leaflet';
import Sketch from '../../models/Sketch';

interface StateUI {
  drawnItems: L.FeatureGroup<any> | undefined;
  drawnItemsRoute: L.FeatureGroup<any> | undefined;
  map: L.DrawMap | undefined;
  sketchList: Sketch[];
}

const initialState: StateUI = {
  map: undefined,
  drawnItems: undefined,
  drawnItemsRoute: undefined,
  sketchList: [],
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMap: (state, action: PayloadAction<L.DrawMap>) => {
      state.map = action.payload;
    },
    setDrawnItems: (state, action: PayloadAction<L.FeatureGroup>) => {
      state.drawnItems = action.payload;
    },
    setDrawnItemsRoute: (state, action: PayloadAction<L.FeatureGroup>) => {
      state.drawnItemsRoute = action.payload;
    },
    addSketch: (state, action: PayloadAction<Sketch>) => {
      state.sketchList = [...state.sketchList, action.payload];
    },
    removeSketch: (state, action: PayloadAction<string>) => {
      state.sketchList = state.sketchList.filter((sketch) => sketch.id !== action.payload);
    },
    rePositionSketch: (state, action: PayloadAction<{ id: string; corners: L.LatLng[] }>) => {
      state.sketchList = state.sketchList.map((sketch) => {
        if (sketch.id === action.payload.id) {
          return { ...sketch, corners: action.payload.corners };
        }
        return sketch;
      });
    },
    setSketchOpacity: (state, action: PayloadAction<{ id: string; opacity: number }>) => {
      state.sketchList = state.sketchList.map((sketch) => {
        if (sketch.id === action.payload.id) {
          return { ...sketch, opacity: action.payload.opacity };
        }
        return sketch;
      });
    },
    setSketchRotation: (state, action: PayloadAction<{ id: string; rotation: number }>) => {
      state.sketchList = state.sketchList.map((sketch) => {
        if (sketch.id === action.payload.id) {
          return { ...sketch, rotation: action.payload.rotation };
        }
        return sketch;
      });
    },
    toggleSketchFrozenStatus: (state, action: PayloadAction<string>) => {
      state.sketchList = state.sketchList.map((sketch) => {
        if (sketch.id === action.payload) {
          return { ...sketch, frozen: !sketch.frozen };
        }
        return sketch;
      });
    },
  },
});

export const { setMap, setDrawnItems, addSketch, removeSketch, setDrawnItemsRoute, rePositionSketch, setSketchOpacity, setSketchRotation, toggleSketchFrozenStatus } = mapSlice.actions;

export default mapSlice.reducer;
