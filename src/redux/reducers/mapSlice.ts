import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface StateUI {
    drawnItems: L.FeatureGroup<any> | undefined
    drawnItemsRoute: L.FeatureGroup<any> | undefined
};

const initialState: StateUI = {
    drawnItems: undefined,
    drawnItemsRoute: undefined
}

export const mapSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
      setDrawnItems: (state, action: PayloadAction<L.FeatureGroup>) => {
        state.drawnItems = action.payload;
      },
      setDrawnItemsRoute: (state, action: PayloadAction<L.FeatureGroup>) => {
        state.drawnItemsRoute = action.payload;
      },
    },
  });

export const { setDrawnItems, setDrawnItemsRoute } = mapSlice.actions

export default mapSlice.reducer