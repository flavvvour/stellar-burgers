jest.mock('@reduxjs/toolkit', () => {
  const actual = jest.requireActual('@reduxjs/toolkit');
  return {
    ...actual,
    nanoid: jest.fn(() => 'fixed-id')
  };
});

import burgerReducer, {
  fetchIngredients,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../slices/burgerSlice';
import { TIngredient } from '@utils-types';
import { AnyAction } from 'redux';
import { ThunkDispatch } from '@reduxjs/toolkit';
import * as api from '@api';
import { isRejectedWithValue } from '@reduxjs/toolkit';

jest.mock('@api');

const testIngredient: TIngredient = {
  _id: '123',
  name: 'Test Sauce',
  type: 'sauce',
  proteins: 0,
  fat: 0,
  carbohydrates: 0,
  calories: 0,
  price: 50,
  image: '',
  image_mobile: '',
  image_large: ''
};

const testBun: TIngredient = {
  ...testIngredient,
  type: 'bun',
  name: 'Test Bun'
};

describe('fetchIngredients thunk', () => {
  const dispatch = jest.fn() as ThunkDispatch<any, any, AnyAction>;
  const getState = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches fulfilled on success', async () => {
    (api.getIngredientsApi as jest.Mock).mockResolvedValue([
      { _id: '123', name: 'Test Ingredient', type: 'sauce' }
    ]);

    const thunk = fetchIngredients();
    const result = await thunk(dispatch, getState, undefined);

    expect(api.getIngredientsApi).toHaveBeenCalled();
    expect(result.type).toBe('burger/fetchIngredients/fulfilled');
    expect(result.payload).toEqual([
      { _id: '123', name: 'Test Ingredient', type: 'sauce' }
    ]);
  });

  it('dispatches rejected on error', async () => {
    (api.getIngredientsApi as jest.Mock).mockRejectedValue(
      new Error('API error')
    );

    const thunk = fetchIngredients();
    const result = await thunk(dispatch, getState, undefined);

    expect(api.getIngredientsApi).toHaveBeenCalled();
    expect(result.type).toBe('burger/fetchIngredients/rejected');

    if ('error' in result && result.error) {
      expect(result.error.message).toBe('API error');
    }
  });
});

describe('burgerSlice', () => {
  const initialState = {
    ingredients: [],
    constructorItems: {
      bun: null,
      ingredients: []
    },
    loading: false,
    error: null
  };

  it('should handle fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = burgerReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchIngredients.fulfilled', () => {
    const payload = [testIngredient];
    const action = { type: fetchIngredients.fulfilled.type, payload };
    const state = burgerReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.ingredients).toEqual(payload);
  });

  it('should handle fetchIngredients.rejected with message', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: 'Some error' }
    };
    const state = burgerReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Some error');
  });

  it('should handle fetchIngredients.rejected without message', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: undefined }
    };
    const state = burgerReducer(initialState, action);
    expect(state.error).toBe('Failed to fetch ingredients');
  });

  it('should handle fetchIngredients.rejected with no error.message', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: {}
    };
    const state = burgerReducer(initialState, action);
    expect(state.error).toBe('Failed to fetch ingredients');
  });

  it('should handle fetchIngredients.rejected fallback to default error', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: {} as any
    };
    const state = burgerReducer(initialState, action);
    expect(state.error).toBe('Failed to fetch ingredients');
  });

  it('should handle fetchIngredients.rejected with missing error', () => {
    const action = {
      type: fetchIngredients.rejected.type
    };
    const state = burgerReducer(initialState, action as any);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to fetch ingredients');
  });

  it('should add bun to constructor', () => {
    const action = addIngredient(testBun);
    const state = burgerReducer(initialState, action);
    expect(state.constructorItems.bun).toEqual(testBun);
  });

  it('should add non-bun ingredient with uniqueId', () => {
    const action = addIngredient(testIngredient);
    const state = burgerReducer(initialState, action);
    expect(state.constructorItems.ingredients.length).toBe(1);
    expect(state.constructorItems.ingredients[0]).toMatchObject({
      _id: '123',
      uniqueId: 'fixed-id'
    });
  });

  it('should remove ingredient by uniqueId', () => {
    const testState = {
      ...initialState,
      constructorItems: {
        bun: null,
        ingredients: [
          { ...testIngredient, id: '123', uniqueId: 'abc' },
          { ...testIngredient, id: '456', uniqueId: 'def' }
        ]
      }
    };
    const action = removeIngredient('abc');
    const state = burgerReducer(testState, action);
    expect(state.constructorItems.ingredients).toHaveLength(1);
    expect(state.constructorItems.ingredients[0].uniqueId).toBe('def');
  });

  it('should move ingredient between indices', () => {
    const i1 = { ...testIngredient, id: '1', uniqueId: 'u1' };
    const i2 = { ...testIngredient, id: '2', uniqueId: 'u2' };
    const testState = {
      ...initialState,
      constructorItems: {
        bun: null,
        ingredients: [i1, i2]
      }
    };
    const action = moveIngredient({ dragIndex: 0, hoverIndex: 1 });
    const state = burgerReducer(testState, action);
    expect(state.constructorItems.ingredients[0].uniqueId).toBe('u2');
    expect(state.constructorItems.ingredients[1].uniqueId).toBe('u1');
  });

  it('should clear constructor', () => {
    const testState = {
      ...initialState,
      constructorItems: {
        bun: testBun,
        ingredients: [{ ...testIngredient, id: '1', uniqueId: 'x' }]
      }
    };
    const state = burgerReducer(testState, clearConstructor());
    expect(state.constructorItems.bun).toBeNull();
    expect(state.constructorItems.ingredients).toHaveLength(0);
  });
});
