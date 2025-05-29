import { checkAuth, loginUser, logoutUser } from '../slices/authSlice';
import { setCookie, deleteCookie } from '../../utils/cookie';
import { getUserApi, loginUserApi, logoutApi } from '../../utils/burger-api';
import { TUser } from '../../utils/types';

import authReducer, {
  setUser,
  clearUser,
  setAuthChecked
} from '../slices/authSlice';

jest.mock('../../utils/burger-api');
jest.mock('../../utils/cookie');

const mockUser: TUser = {
  name: 'Test User',
  email: 'test@example.com'
};

const dispatch = jest.fn();
const getState = jest.fn();

it('loginUser failure without message (fallback)', async () => {
  (loginUserApi as jest.Mock).mockRejectedValue({});

  const result = await loginUser({ email: '', password: '' })(
    dispatch,
    getState,
    undefined
  );

  expect(result.payload).toBe('Ошибка авторизации');
  expect(result.type).toBe('auth/loginUser/rejected');
});

it('handles checkAuth.fulfilled', () => {
  const newState = authReducer(undefined, {
    type: checkAuth.fulfilled.type,
    payload: mockUser
  });
  expect(newState.user).toEqual(mockUser);
  expect(newState.isAuthChecked).toBe(true);
});

it('handles checkAuth.rejected', () => {
  const newState = authReducer(undefined, { type: checkAuth.rejected.type });
  expect(newState.user).toBe(null);
  expect(newState.isAuthChecked).toBe(true);
});

it('handles loginUser.fulfilled', () => {
  const newState = authReducer(undefined, {
    type: loginUser.fulfilled.type,
    payload: mockUser
  });
  expect(newState.user).toEqual(mockUser);
  expect(newState.isAuthChecked).toBe(true);
});

it('handles loginUser.rejected', () => {
  const newState = authReducer(undefined, { type: loginUser.rejected.type });
  expect(newState.user).toBe(null);
  expect(newState.isAuthChecked).toBe(true);
});

describe('authSlice reducer (extraReducers)', () => {
  it('handles logoutUser.fulfilled', () => {
    const prevState = {
      user: { name: 'Someone', email: 'some@some.com' },
      isAuthChecked: false
    };

    const newState = authReducer(prevState, {
      type: logoutUser.fulfilled.type
    });
    expect(newState.user).toBe(null);
    expect(newState.isAuthChecked).toBe(true);
  });
});

describe('authSlice reducers', () => {
  const initialState = {
    user: null,
    isAuthChecked: false
  };

  it('setUser sets user and auth checked', () => {
    const newState = authReducer(initialState, setUser(mockUser));
    expect(newState.user).toEqual(mockUser);
    expect(newState.isAuthChecked).toBe(true);
  });

  it('clearUser resets user and auth check', () => {
    const filledState = {
      user: mockUser,
      isAuthChecked: true
    };
    const newState = authReducer(filledState, clearUser());
    expect(newState.user).toBe(null);
    expect(newState.isAuthChecked).toBe(false);
  });

  it('setAuthChecked sets isAuthChecked true', () => {
    const newState = authReducer(initialState, setAuthChecked());
    expect(newState.isAuthChecked).toBe(true);
  });
});

describe('authSlice thunks', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: jest.fn((key: string) => store[key]),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: () => {
        store = {};
      }
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

  it('checkAuth success', async () => {
    (getUserApi as jest.Mock).mockResolvedValue({ user: mockUser });

    const result = await checkAuth()(dispatch, getState, undefined);

    expect(result.payload).toEqual(mockUser);
    expect(result.type).toBe('auth/checkAuth/fulfilled');
  });

  it('checkAuth failure', async () => {
    (getUserApi as jest.Mock).mockRejectedValue(new Error('fail'));

    const result = await checkAuth()(dispatch, getState, undefined);

    expect(result.payload).toBe(null);
    expect(result.type).toBe('auth/checkAuth/rejected');
  });

  it('loginUser with Bearer token', async () => {
    (loginUserApi as jest.Mock).mockResolvedValue({
      accessToken: 'Bearer testtoken',
      refreshToken: 'refreshtoken',
      user: mockUser
    });

    const result = await loginUser({ email: '', password: '' })(
      dispatch,
      getState,
      undefined
    );

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'accessToken',
      'testtoken'
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'refreshToken',
      'refreshtoken'
    );
    expect(setCookie).toHaveBeenCalledWith('accessToken', 'testtoken');
    expect(result.payload).toEqual(mockUser);
    expect(result.type).toBe('auth/loginUser/fulfilled');
  });

  it('loginUser with raw token', async () => {
    (loginUserApi as jest.Mock).mockResolvedValue({
      accessToken: 'raw.token.value',
      refreshToken: 'refreshtoken',
      user: mockUser
    });

    const result = await loginUser({ email: '', password: '' })(
      dispatch,
      getState,
      undefined
    );

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'accessToken',
      'raw.token.value'
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'refreshToken',
      'refreshtoken'
    );
    expect(setCookie).toHaveBeenCalledWith('accessToken', 'raw.token.value');
    expect(result.payload).toEqual(mockUser);
  });

  it('loginUser failure', async () => {
    (loginUserApi as jest.Mock).mockRejectedValue(new Error('auth error'));

    const result = await loginUser({ email: '', password: '' })(
      dispatch,
      getState,
      undefined
    );

    expect(result.payload).toBe('auth error');
    expect(result.type).toBe('auth/loginUser/rejected');
  });

  it('logoutUser success', async () => {
    const result = await logoutUser()(dispatch, getState, undefined);

    expect(logoutApi).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(deleteCookie).toHaveBeenCalledWith('accessToken');
    expect(result.type).toBe('auth/logoutUser/fulfilled');
  });

  it('logoutUser failure', async () => {
    (logoutApi as jest.Mock).mockRejectedValue(new Error('fail'));

    const result = await logoutUser()(dispatch, getState, undefined);

    expect(result.payload).toBe('Ошибка при выходе');
    expect(result.type).toBe('auth/logoutUser/rejected');
  });
});
