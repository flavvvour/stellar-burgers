import ingredientsReducer, {
  fetchIngredients
} from '../slices/ingredientsSlice';
import { TIngredient } from '@utils-types';
import { AnyAction } from 'redux';
import { ThunkDispatch } from '@reduxjs/toolkit';

const mockIngredient: TIngredient = {
  _id: '1',
  name: 'Булка',
  type: 'bun',
  proteins: 10,
  fat: 20,
  carbohydrates: 30,
  calories: 100,
  price: 200,
  image: '',
  image_mobile: '',
  image_large: ''
};

describe('ingredientsSlice reducer', () => {
  it('handles fetchIngredients.pending', () => {
    const initialState = {
      ingredients: [],
      isLoading: false,
      error: null
    };
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('handles fetchIngredients.fulfilled', () => {
    const initialState = {
      ingredients: [],
      isLoading: true,
      error: null
    };
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: [mockIngredient]
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.ingredients).toEqual([mockIngredient]);
  });

  it('handles fetchIngredients.rejected with payload message', () => {
    const initialState = {
      ingredients: [],
      isLoading: true,
      error: null
    };
    const action = {
      type: fetchIngredients.rejected.type,
      payload: 'Ошибка загрузки'
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Ошибка загрузки');
  });
});

describe('fetchIngredients thunk logic', () => {
  const mockDispatch = jest.fn() as ThunkDispatch<any, any, AnyAction>;
  const mockGetState = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('rejects with message if response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Ошибка сервера' })
    });

    const thunk = fetchIngredients();
    const result = await thunk(mockDispatch, mockGetState, {
      rejectWithValue: (value: string) => value
    });

    expect(result.payload).toBe('Ошибка сервера');
    expect(result.type).toBe('ingredients/fetchAll/rejected');
  });

  it('rejects with default message if fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    const thunk = fetchIngredients();
    const result = await thunk(mockDispatch, mockGetState, {
      rejectWithValue: (value: string) => value
    });

    expect(result.payload).toBe('Ошибка загрузки ингредиентов');
    expect(result.type).toBe('ingredients/fetchAll/rejected');
  });

  it('resolves successfully and returns ingredients array', async () => {
    const mockData = {
      data: [mockIngredient]
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    const thunk = fetchIngredients();
    const result = await thunk(mockDispatch, mockGetState, {
      rejectWithValue: (v: string) => v
    });

    expect(result.payload).toEqual([mockIngredient]);
    expect(result.type).toBe('ingredients/fetchAll/fulfilled');
  });
});

describe('fetchIngredients thunk', () => {
  const dispatch = jest.fn() as ThunkDispatch<any, any, AnyAction>;
  const getState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles server error with custom message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Сервер сказал нет' })
    });

    const thunk = fetchIngredients();
    const result = await thunk(dispatch, getState, {
      rejectWithValue: (v: string) => v
    });

    expect(result.payload).toBe('Сервер сказал нет');
    expect(result.type).toBe('ingredients/fetchAll/rejected');
  });

  it('handles server error with no message (fallback)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    });

    const thunk = fetchIngredients();
    const result = await thunk(dispatch, getState, {
      rejectWithValue: (v: string) => v
    });

    expect(result.payload).toBe('Ошибка запроса');
    expect(result.type).toBe('ingredients/fetchAll/rejected');
  });
});
