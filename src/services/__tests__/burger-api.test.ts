/**
 * @jest-environment jsdom
 */
import {
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  fetchWithRefresh,
  checkResponse,
  updateUserApi,
  registerUserApi,
  orderBurgerApi,
  getFeedsApi,
  getOrderByNumberApi,
  getIngredientsApi,
  getOrdersApi,
  forgotPasswordApi,
  resetPasswordApi
} from '../../utils/burger-api';

import { setCookie, getCookie, deleteCookie } from '../../utils/cookie';

jest.mock('../../utils/cookie');

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockResponse = (ok: boolean, body: any) =>
  ({
    ok,
    json: () => Promise.resolve(body)
  }) as Response;

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: (() => {
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
    })(),
    writable: true
  });
  document.cookie = '';
});

describe('getAuthHeaders', () => {
  it('returns headers with token', () => {
    (getCookie as jest.Mock).mockReturnValue('abc123');
    const { getAuthHeaders } = require('../../utils/burger-api');
    expect(getAuthHeaders()).toEqual({ authorization: 'Bearer abc123' });
  });

  it('returns empty object if no token', () => {
    (getCookie as jest.Mock).mockReturnValue('');
    const { getAuthHeaders } = require('../../utils/burger-api');
    expect(getAuthHeaders()).toEqual({});
  });
});

describe('checkResponse', () => {
  it('resolves on ok response', async () => {
    const res = mockResponse(true, { ok: true });
    const result = await checkResponse(res);
    expect(result).toEqual({ ok: true });
  });

  it('rejects on error response', async () => {
    const res = mockResponse(false, { message: 'Ошибка' });
    await expect(checkResponse(res)).rejects.toEqual({ message: 'Ошибка' });
  });
});

describe('refreshToken', () => {
  it('returns data and saves tokens', async () => {
    localStorage.setItem('refreshToken', 'refresh');
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        accessToken: 'Bearer abc',
        refreshToken: 'new-refresh'
      })
    );
    const data = await refreshToken();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh'
    );
    expect(setCookie).toHaveBeenCalledWith('accessToken', 'abc');
    expect(data.success).toBe(true);
  });

  it('fails if no token in localStorage', async () => {
    localStorage.clear();
    await expect(refreshToken()).rejects.toThrow(
      'No refresh token in localStorage'
    );
  });

  it('rejects if response.success is false', async () => {
    localStorage.setItem('refreshToken', 'refresh');
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(refreshToken()).rejects.toEqual({ success: false });
  });

  it('uses raw access token without Bearer prefix', async () => {
    localStorage.setItem('refreshToken', 'refresh');
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        accessToken: 'abc123',
        refreshToken: 'new-refresh'
      })
    );
    const result = await refreshToken();
    expect(setCookie).toHaveBeenCalledWith('accessToken', 'abc123');
    expect(result.accessToken).toBe('abc123');
  });
});

describe('fetchWithRefresh', () => {
  it('returns result on first try', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { ok: true }));
    const data = await fetchWithRefresh('some-url', {});
    expect(data).toEqual({ ok: true });
  });

  it('retries after jwt expired', async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse(false, { message: 'jwt expired' }))
      .mockResolvedValueOnce(mockResponse(true, { success: true }))
      .mockResolvedValueOnce(
        mockResponse(true, {
          success: true,
          accessToken: 'Bearer abc',
          refreshToken: 'new-refresh'
        })
      );

    localStorage.setItem('refreshToken', 'refresh');
    const result = await fetchWithRefresh<{ success: boolean }>('some-url', {
      headers: {}
    });
    expect(result.success).toBe(true);
  });

  it('rejects on non-jwt error', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(false, { message: 'some other error' })
    );
    await expect(fetchWithRefresh('some-url', {})).rejects.toEqual({
      message: 'some other error'
    });
  });
});

describe('logoutApi', () => {
  it('clears storage and cookie on success', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: true }));
    localStorage.setItem('refreshToken', 'refresh');
    const result = await logoutApi();
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(deleteCookie).toHaveBeenCalledWith('accessToken');
    expect(result.success).toBe(true);
  });

  it('does nothing if success is false or missing', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    const result = await logoutApi();
    expect(localStorage.removeItem).not.toHaveBeenCalledWith('refreshToken');
    expect(deleteCookie).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('skips clearing if success is missing', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, {}));
    const result = await logoutApi();
    expect(deleteCookie).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });
});

describe('getUserApi', () => {
  it('returns user when success', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        user: { name: 'Test', email: 'test@example.com' }
      })
    );
    const user = await getUserApi();
    expect(user.user.name).toBe('Test');
  });

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(getUserApi()).rejects.toThrow('Ошибка получения пользователя');
  });
});

describe('updateUserApi', () => {
  it('resolves with user data if success is true', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        user: { name: 'Updated', email: 'test@example.com' }
      })
    );
    const result = await updateUserApi({ name: 'Updated' });
    expect(result.user.name).toBe('Updated');
  });

  it('rejects if success is false', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: false,
        user: null
      })
    );
    await expect(updateUserApi({ name: 'Fail' })).rejects.toEqual({
      success: false,
      user: null
    });
  });

  it('rejects if response does not contain success field', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, {}));
    await expect(updateUserApi({ name: 'Fallback' })).rejects.toEqual({});
  });
});
describe('loginUserApi', () => {
  it('returns auth data on success', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { name: 'User', email: 'u@test.com' }
      })
    );
    const result = await loginUserApi({ email: 'u@test.com', password: '123' });
    expect(result.user.email).toBe('u@test.com');
  });

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(
      loginUserApi({ email: 'fail@test.com', password: '123' })
    ).rejects.toEqual({ success: false });
  });

  it('rejects if success is missing', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, {}));
    await expect(loginUserApi({ email: '', password: '' })).rejects.toEqual({});
  });
});

describe('registerUserApi', () => {
  it('returns new user data on success', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { name: 'New', email: 'new@test.com' }
      })
    );
    const result = await registerUserApi({
      name: 'New',
      email: 'new@test.com',
      password: '123'
    });
    expect(result.user.name).toBe('New');
  });

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(
      registerUserApi({
        name: 'Test',
        email: 'fail@test.com',
        password: '123'
      })
    ).rejects.toEqual({ success: false });
  });

  it('rejects if success is missing', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, {}));
    await expect(
      registerUserApi({ email: '', name: '', password: '' })
    ).rejects.toEqual({});
  });
});

describe('forgotPasswordApi', () => {
  it('returns result if success', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: true }));
    const result = await forgotPasswordApi({ email: 'a@a.com' });
    expect(result.success).toBe(true);
  });

  it('throws if not success', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(forgotPasswordApi({ email: 'fail@test.com' })).rejects.toEqual(
      {
        success: false
      }
    );
  });

  it('rejects if success is missing', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, {}));
    await expect(forgotPasswordApi({ email: '' })).rejects.toEqual({});
  });
});

describe('resetPasswordApi', () => {
  it('returns result if success', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: true }));
    const result = await resetPasswordApi({ password: '123', token: 'token' });
    expect(result.success).toBe(true);
  });

  it('throws if not success', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(
      resetPasswordApi({ password: '123', token: 'invalid' })
    ).rejects.toEqual({ success: false });
  });

  it('rejects if success is missing', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, {}));
    await expect(resetPasswordApi({ password: '', token: '' })).rejects.toEqual(
      {}
    );
  });
});

describe('orderBurgerApi', () => {
  it('returns order data if success', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        order: { number: 555 },
        name: 'Test Burger'
      })
    );
    const result = await orderBurgerApi(['abc123']);
    expect(result.name).toBe('Test Burger');
  });

  it('throws on failure', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(orderBurgerApi(['1'])).rejects.toEqual({ success: false });
  });
});

describe('getFeedsApi', () => {
  it('returns feeds if success', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        orders: [],
        total: 10,
        totalToday: 1
      })
    );
    const result = await getFeedsApi();
    expect(result.total).toBe(10);
  });

  it('throws if success is false', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(getFeedsApi()).rejects.toEqual({ success: false });
  });

  it('resolves with data if success is true', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        orders: [],
        total: 1,
        totalToday: 1
      })
    );
    const result = await getFeedsApi();
    expect(result.total).toBe(1);
  });
});

describe('getOrderByNumberApi', () => {
  it('returns order by number', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        orders: [{ number: 1 }]
      })
    );
    const result = await getOrderByNumberApi(1);
    expect(result.orders[0].number).toBe(1);
  });

  it('adds auth header when withAuth=true', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        orders: [{ number: 77 }]
      })
    );
    const result = await getOrderByNumberApi(77, true);
    expect(result.orders[0].number).toBe(77);
  });

  it('sends request without auth if withAuth is false', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        orders: [{ number: 123 }]
      })
    );
    const result = await getOrderByNumberApi(123);
    expect(result.orders[0].number).toBe(123);
  });
});

describe('getIngredientsApi', () => {
  it('throws if success is missing', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { data: [] }));
    await expect(getIngredientsApi()).rejects.toEqual({ data: [] });
  });

  it('throws if success is false', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(getIngredientsApi()).rejects.toEqual({ success: false });
  });

  it('resolves with data if success is true', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        data: [{ _id: '1', name: 'Test Ingredient' }]
      })
    );
    const result = await getIngredientsApi();
    expect(result).toEqual([{ _id: '1', name: 'Test Ingredient' }]);
  });
});

describe('getOrdersApi', () => {
  it('returns orders if success', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        orders: [{ number: 999 }],
        total: 1,
        totalToday: 1
      })
    );
    const result = await getOrdersApi();
    expect(result[0].number).toBe(999);
  });

  it('rejects if success is false', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(true, { success: false }));
    await expect(getOrdersApi()).rejects.toEqual({ success: false });
  });

  it('resolves with orders if success is true', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse(true, {
        success: true,
        orders: [{ number: 42 }],
        total: 1,
        totalToday: 1
      })
    );
    const result = await getOrdersApi();
    expect(result).toEqual([{ number: 42 }]);
  });
});
