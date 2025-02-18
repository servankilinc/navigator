import { createSlice, PayloadAction } from '@reduxjs/toolkit' 
import Floor from '../../models/Floor';

interface StateUI {
    isEntrancePointAdded: boolean,
    currentFloor: Floor | undefined,
    startLocaltion?: string;
    targetLocaltion?: string;
};

const initialState: StateUI = {
    isEntrancePointAdded: true,
    currentFloor: undefined
}

export const appSlice = createSlice({
    name: 'appSlice',
    initialState,
    reducers: {
        setEntranceAdded: (state, action: PayloadAction<boolean>) => {
            state.isEntrancePointAdded = action.payload;
        },
        setCurrentFloor: (state, action: PayloadAction<Floor>) => {
            state.currentFloor = action.payload;
        },
        setStartLocation: (state, action: PayloadAction<string>) => {
            state.startLocaltion= action.payload;
        },
        setTargetLocation: (state, action: PayloadAction<string>) => {
            state.targetLocaltion = action.payload;
        },
    },
})

export const { setEntranceAdded, setCurrentFloor, setStartLocation, setTargetLocation } = appSlice.actions

export default appSlice.reducer