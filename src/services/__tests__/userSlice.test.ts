import reducer, { registerUserThunk } from '../slices/userSlice';
import { setCookie } from '../../utils/cookie';
import { registerUserApi } from '../../utils/burger-api';
import { TUser } from '../../utils/types';

jest.mock('../../utils/burger-api');
jest.mock('../../utils/cookie');

const mockUser: TUser = {
  name: 'Test User',
  email: 'test@example.com'
};

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthChecked: false
};

describe('userSlice reducer', () => {
  it('should handle registerUserThunk.pending', () => {
    const action = { type: registerUserThunk.pending.type };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle registerUserThunk.fulfilled', () => {
    const action = {
      type: registerUserThunk.fulfilled.type,
      payload: {
        user: mockUser,
        accessToken: 'Bearer token',
        refreshToken: 'refreshToken',
        success: true
      }
    };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockUser);
  });

  it('should handle registerUserThunk.rejected', () => {
    const action = {
      type: registerUserThunk.rejected.type,
      payload: 'Ошибка регистрации'
    };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Ошибка регистрации');
  });

  it('should handle registerUserThunk.rejected with undefined payload', () => {
    const action = {
      type: registerUserThunk.rejected.type,
      payload: undefined
    };
    const state = reducer(initialState, action);
    expect(state.error).toBe('Ошибка регистрации');
    expect(state.loading).toBe(false);
  });
});

describe('registerUserThunk logic', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const extra = { rejectWithValue: (msg: string) => msg };

  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key]),
      setItem: jest.fn((key: string, value: string) => (store[key] = value)),
      removeItem: jest.fn((key: string) => delete store[key]),
      clear: () => (store = {})
    };
  })();

  beforeAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('dispatches fulfilled when API call succeeds', async () => {
    (registerUserApi as jest.Mock).mockResolvedValue({
      user: mockUser,
      accessToken: 'Bearer abc',
      refreshToken: 'refresh',
      success: true
    });

    const thunk = registerUserThunk({
      name: 'Test',
      email: 't@test.com',
      password: '123'
    });

    const result = await thunk(dispatch, getState, undefined);

    expect(setCookie).toHaveBeenCalledWith('accessToken', 'abc');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'refreshToken',
      'refresh'
    );

    if (result.payload && typeof result.payload !== 'string') {
      expect(result.payload.user).toEqual(mockUser);
    } else {
      throw new Error('Payload should not be string on success');
    }
  });

  it('dispatches rejected when API call fails', async () => {
    (registerUserApi as jest.Mock).mockRejectedValue(new Error('fail'));

    const thunk = registerUserThunk({
      name: 'Fail',
      email: 'fail@test.com',
      password: '123'
    });

    const result = await thunk(dispatch, getState, undefined);

    expect(result.payload).toBe('fail');
    expect(result.type).toBe('user/register/rejected');
  });
  it('handles accessToken without "Bearer "', async () => {
    (registerUserApi as jest.Mock).mockResolvedValue({
      user: mockUser,
      accessToken: 'plain_token',
      refreshToken: 'refresh',
      success: true
    });

    const thunk = registerUserThunk({
      name: 'Test2',
      email: 'plain@test.com',
      password: '123'
    });

    const result = await thunk(dispatch, getState, undefined);

    expect(setCookie).toHaveBeenCalledWith('accessToken', 'plain_token');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'refreshToken',
      'refresh'
    );

    if (result.payload && typeof result.payload !== 'string') {
      expect(result.payload.user).toEqual(mockUser);
    } else {
      throw new Error('Payload should not be string on success');
    }
  });
  it('dispatches rejected with default message if error.message is undefined', async () => {
    const customError = {};
    (registerUserApi as jest.Mock).mockRejectedValue(customError);

    const thunk = registerUserThunk({
      name: 'Unknown',
      email: 'unknown@test.com',
      password: '123'
    });

    const result = await thunk(dispatch, getState, undefined);

    expect(result.payload).toBe('Ошибка регистрации');
    expect(result.type).toBe('user/register/rejected');
  });
});
