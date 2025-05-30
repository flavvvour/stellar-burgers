import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder } from '@utils-types';

type TOrderState = {
  currentOrder: TOrder | null;
  loading: boolean;
  error: string | null;
};

const initialState: TOrderState = {
  currentOrder: null,
  loading: false,
  error: null
};

export const createOrderThunk = createAsyncThunk<
  TOrder,
  string[],
  { rejectValue: string }
>('order/create', async (ingredientIds, thunkAPI) => {
  try {
    const response = await orderBurgerApi(ingredientIds);
    return response.order;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Ошибка оформления');
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder(state) {
      state.currentOrder = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка';
      });
  }
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
