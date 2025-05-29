import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  TRegisterData,
  TAuthResponse,
  TUser,
  TUserResponse
} from '@utils-types';
import { registerUserApi, getUserApi } from '@api';
import { setCookie } from '../../utils/cookie';

export const registerUserThunk = createAsyncThunk<
  TAuthResponse,
  TRegisterData,
  { rejectValue: string }
>('user/register', async (data, thunkAPI) => {
  try {
    const response = await registerUserApi(data);

    let tokenToSave = response.accessToken;
    if (typeof tokenToSave === 'string' && tokenToSave.startsWith('Bearer ')) {
      tokenToSave = tokenToSave.substring(7);
    }
    console.log('[registerUserThunk] Сохраняем accessToken:', tokenToSave);

    setCookie('accessToken', tokenToSave);
    localStorage.setItem('refreshToken', response.refreshToken);

    return response;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || 'Ошибка регистрации');
  }
});

interface UserState {
  user: TUser | null;
  loading: boolean;
  error: string | null;
  isAuthChecked: boolean;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  isAuthChecked: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка регистрации';
      });
  }
});

export default userSlice.reducer;
