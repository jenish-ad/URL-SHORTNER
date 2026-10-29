import { configureStore } from "@reduxjs/toolkit";
import { QueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import authReducer from "./slice/authSlice";

export const store = configureStore({ reducer: { auth: authReducer } });

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const useAppSelector = useSelector.withTypes<RootState>();

export const queryClient = new QueryClient();

export default store;
