import feedReducer, {
  setFeedConnected,
  setFeedError,
  setFeedOrders
} from '../slices/feedSlice';

import { TOrder } from '@utils-types';

describe('feedSlice', () => {
  const initialState = {
    orders: [],
    total: 0,
    totalToday: 0,
    connected: false,
    error: undefined
  };

  const mockOrders: TOrder[] = [
    {
      _id: '1',
      name: 'Test Order',
      status: 'done',
      number: 123,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      ingredients: []
    }
  ];

  it('should handle setFeedConnected', () => {
    const state = feedReducer(initialState, setFeedConnected(true));
    expect(state.connected).toBe(true);
  });

  it('should handle setFeedError', () => {
    const state = feedReducer(initialState, setFeedError('Ошибка подключения'));
    expect(state.error).toBe('Ошибка подключения');
  });

  it('should handle setFeedOrders', () => {
    const state = feedReducer(
      initialState,
      setFeedOrders({
        orders: mockOrders,
        total: 10,
        totalToday: 2
      })
    );
    expect(state.orders).toEqual(mockOrders);
    expect(state.total).toBe(10);
    expect(state.totalToday).toBe(2);
  });
});
