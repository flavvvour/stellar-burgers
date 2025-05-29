import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TUser } from '../../utils/types';
import { getUserApi, loginUserApi } from '../../utils/burger-api';
import { setCookie } from '../../utils/cookie';
import { logoutApi } from '../../utils/burger-api';
import { deleteCookie } from '../../utils/cookie';

type TAuthState = {
  user: TUser | null;
  isAuthChecked: boolean;
};

const initialState: TAuthState = {
  user: null,
  isAuthChecked: false
};

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, thunkAPI) => {
    try {
      const res = await getUserApi();
      return res.user;
    } catch (e) {
      return thunkAPI.rejectWithValue(null);
    }
  }
);
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await loginUserApi(data);
      if (res.accessToken) {
        const rawToken = res.accessToken;
        const token = rawToken.startsWith('Bearer ')
          ? rawToken.slice(7)
          : rawToken;
        localStorage.setItem('accessToken', token);
        setCookie('accessToken', token);
      }
      if (res.refreshToken)
        localStorage.setItem('refreshToken', res.refreshToken);
      return res.user;
    } catch (e: any) {
      return thunkAPI.rejectWithValue(e.message || 'Ошибка авторизации');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, thunkAPI) => {
    try {
      await logoutApi();
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      deleteCookie('accessToken');
    } catch (e) {
      return thunkAPI.rejectWithValue('Ошибка при выходе');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthChecked = true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthChecked = false;
    },
    setAuthChecked(state) {
      state.isAuthChecked = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthChecked = true;
    });
  }
});

export const { setUser, clearUser, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
