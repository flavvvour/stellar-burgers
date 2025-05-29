import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  connected: boolean;
  error?: string;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  connected: false
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFeedConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setFeedError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setFeedOrders(
      state,
      action: PayloadAction<{
        orders: TOrder[];
        total: number;
        totalToday: number;
      }>
    ) {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    }
  }
});

export const { setFeedConnected, setFeedError, setFeedOrders } =
  feedSlice.actions;

export default feedSlice.reducer;
