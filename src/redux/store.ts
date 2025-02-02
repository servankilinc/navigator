import { configureStore } from '@reduxjs/toolkit';
import appReducer from './reducers/appSlice';
import storageReducer from './reducers/storageSlice';
import mapReducer from './reducers/mapSlice';
import alertReducer from './reducers/alertSlice';

export const store = configureStore({
  reducer: {
    appReducer: appReducer,
    mapReducer: mapReducer,
    storageReducer: storageReducer,
    alertReducer: alertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
