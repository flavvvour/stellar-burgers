/**
 * @jest-environment jsdom
 */
import orderReducer, {
  clearOrder,
  createOrderThunk
} from '../slices/orderSlice';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder } from '@utils-types';
import { AnyAction } from 'redux';
import { ThunkDispatch } from '@reduxjs/toolkit';

jest.mock('../../utils/burger-api');

const mockOrder: TOrder = {
  _id: 'order123',
  number: 123,
  name: 'Test Order',
  status: 'done',
  createdAt: '2025-05-30T12:00:00.000Z',
  updatedAt: '2025-05-30T12:00:00.000Z',
  ingredients: ['ingredient1', 'ingredient2']
};

describe('orderSlice reducer', () => {
  const initialState = {
    currentOrder: null,
    loading: false,
    error: null
  };

  it('clearOrder resets currentOrder and error', () => {
    const filledState = {
      currentOrder: mockOrder,
      loading: false,
      error: 'Some error'
    };
    const newState = orderReducer(filledState, clearOrder());
    expect(newState.currentOrder).toBeNull();
    expect(newState.error).toBeNull();
  });

  it('createOrderThunk.pending sets loading true and clears error', () => {
    const state = orderReducer(initialState, {
      type: createOrderThunk.pending.type
    });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('createOrderThunk.fulfilled sets currentOrder and loading false', () => {
    const state = orderReducer(initialState, {
      type: createOrderThunk.fulfilled.type,
      payload: mockOrder
    });
    expect(state.currentOrder).toEqual(mockOrder);
    expect(state.loading).toBe(false);
  });

  it('createOrderThunk.rejected sets error and loading false (with payload)', () => {
    const state = orderReducer(initialState, {
      type: createOrderThunk.rejected.type,
      payload: 'Ошибка'
    });
    expect(state.error).toBe('Ошибка');
    expect(state.loading).toBe(false);
  });

  it('createOrderThunk.rejected sets default error if payload is undefined', () => {
    const state = orderReducer(initialState, {
      type: createOrderThunk.rejected.type,
      payload: undefined
    });
    expect(state.error).toBe('Ошибка');
  });
});

describe('createOrderThunk async', () => {
  const dispatch = jest.fn() as ThunkDispatch<any, any, AnyAction>;
  const getState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches fulfilled on success', async () => {
    (orderBurgerApi as jest.Mock).mockResolvedValue({ order: mockOrder });

    const result = await createOrderThunk(['id1', 'id2'])(
      dispatch,
      getState,
      undefined
    );

    expect(result.type).toBe('order/create/fulfilled');
    expect(result.payload).toEqual(mockOrder);
  });

  it('dispatches rejected on error', async () => {
    (orderBurgerApi as jest.Mock).mockRejectedValue(new Error('fail'));

    const result = await createOrderThunk(['id1', 'id2'])(
      dispatch,
      getState,
      undefined
    );

    expect(result.type).toBe('order/create/rejected');
    expect(result.payload).toBe('fail');
  });
  it('dispatches rejected with default message if error has no message', async () => {
    (orderBurgerApi as jest.Mock).mockRejectedValue({});

    const result = await createOrderThunk(['id1'])(
      dispatch,
      getState,
      undefined
    );

    expect(result.type).toBe('order/create/rejected');
    expect(result.payload).toBe('Ошибка оформления');
  });
});
