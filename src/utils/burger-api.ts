import { setCookie, getCookie, deleteCookie } from './cookie';
import { TIngredient, TOrder, TOrdersData, TUser } from './types';

const URL = process.env.REACT_APP_BURGER_API_URL;

export function getAuthHeaders(): Record<string, string> {
  const token = getCookie('accessToken');
  return token ? { authorization: `Bearer ${token}` } : {};
}

export const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then((err) => Promise.reject(err));

type TServerResponse<T> = {
  success: boolean;
} & T;

type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

export const refreshToken = (): Promise<TRefreshResponse> => {
  const token = localStorage.getItem('refreshToken');
  if (!token) {
    return Promise.reject(new Error('No refresh token in localStorage'));
  }
  return fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ token })
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((refreshData) => {
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      localStorage.setItem('refreshToken', refreshData.refreshToken);

      let tokenToSave = refreshData.accessToken;
      if (
        typeof refreshData.accessToken === 'string' &&
        refreshData.accessToken.startsWith('Bearer ')
      ) {
        tokenToSave = refreshData.accessToken.substring(7);
      }
      setCookie('accessToken', tokenToSave);
      return refreshData;
    });
};

export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
) => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err) {
    if ((err as { message: string }).message === 'jwt expired') {
      const refreshData = await refreshToken();
      if (options.headers) {
        (options.headers as Record<string, string>).authorization =
          `Bearer ${refreshData.accessToken}`;
      }
      const res = await fetch(url, options);
      return await checkResponse<T>(res);
    }
    return Promise.reject(err);
  }
};

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

export type TOrdersResponse = TServerResponse<{
  data: TOrder[];
}>;

export const getIngredientsApi = () =>
  fetch(`${URL}/ingredients`)
    .then((res) => checkResponse<TIngredientsResponse>(res))
    .then((data) => {
      if (data?.success) return data.data;
      return Promise.reject(data);
    });

export const getFeedsApi = () =>
  fetch(`${URL}/orders/all`)
    .then((res) => checkResponse<TFeedsResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export const getOrdersApi = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json;charset=utf-8',
    ...getAuthHeaders()
  };

  return fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
    method: 'GET',
    headers
  }).then((data) => {
    if (data?.success) return data.orders;
    return Promise.reject(data);
  });
};

type TNewOrderResponse = TServerResponse<{
  order: TOrder;
  name: string;
}>;

export const orderBurgerApi = (data: string[]) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json;charset=utf-8',
    ...getAuthHeaders()
  };

  return fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ingredients: data })
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
  });
};

export type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

export const getOrderByNumberApi = (
  number: number,
  withAuth: boolean = false
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (withAuth) {
    Object.assign(headers, getAuthHeaders());
  }

  return fetchWithRefresh<TOrderResponse>(`${URL}/orders/${number}`, {
    method: 'GET',
    headers
  });
};

export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

export type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

export const registerUserApi = (data: TRegisterData) =>
  fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (!data.success) return Promise.reject(data);

      localStorage.setItem('refreshToken', data.refreshToken);

      const tokenToSave = data.accessToken.startsWith('Bearer ')
        ? data.accessToken.substring(7)
        : data.accessToken;

      setCookie('accessToken', tokenToSave);

      return data;
    });

export type TLoginData = {
  email: string;
  password: string;
};

export const loginUserApi = (data: TLoginData) =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (!data.success) return Promise.reject(data);

      localStorage.setItem('refreshToken', data.refreshToken);

      const tokenToSave = data.accessToken.startsWith('Bearer ')
        ? data.accessToken.substring(7)
        : data.accessToken;

      setCookie('accessToken', tokenToSave);

      return data;
    });

export const forgotPasswordApi = (data: { email: string }) =>
  fetch(`${URL}/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export const resetPasswordApi = (data: { password: string; token: string }) =>
  fetch(`${URL}/password-reset/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export type TUserResponse = TServerResponse<{ user: TUser }>;

export const getUserApi = async (): Promise<TUserResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders()
  };
  console.log('[getUserApi] Headers:', headers);
  const data = await fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'GET',
    headers
  });

  if (!data.success) {
    throw new Error('Ошибка получения пользователя');
  }

  return data;
};

export const updateUserApi = (user: Partial<TRegisterData>) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json;charset=utf-8',
    ...getAuthHeaders()
  };

  return fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(user)
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
  });
};

export const logoutApi = () =>
  fetch(`${URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data.success) {
        localStorage.removeItem('refreshToken');
        deleteCookie('accessToken');
      }
      return data;
    });
