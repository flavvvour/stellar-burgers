import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import { getOrdersApi } from '../../utils/burger-api';

type TOrdersState = {
  orders: TOrder[];
  isConnected: boolean;
  error: string | null;
};

const initialState: TOrdersState = {
  orders: [],
  isConnected: false,
  error: null
};

export const fetchUserOrders = createAsyncThunk<TOrder[]>(
  'orders/fetchUserOrders',
  async (_, thunkAPI) => {
    try {
      const result = await getOrdersApi();
      return result;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Ошибка загрузки заказов');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<TOrder[]>) {
      state.orders = action.payload;
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserOrders.fulfilled, (state, action) => {
      state.orders = action.payload;
    });
  }
});

export const { setOrders, setConnected, setError } = ordersSlice.actions;
export default ordersSlice.reducer;
