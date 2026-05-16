import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import goodsReducer from './slices/goodsSlice';
import ordersReducer from './slices/ordersSlice';
import referencesReducer from './slices/referencesSlice';
import suppliersReducer from './slices/suppliersSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goods: goodsReducer,
    orders: ordersReducer,
    references: referencesReducer,
    suppliers: suppliersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (s: RootState) => T) => useSelector(selector);