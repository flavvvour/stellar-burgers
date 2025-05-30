import { FC, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { ProfileOrdersUI } from '@ui-pages';
import {
  setOrders,
  setConnected,
  setError
} from '../../services/slices/ordersSlice';
import { getCookie } from '../../utils/cookie';

export const ProfileOrders: FC = () => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket | null>(null);
  const orders = useAppSelector((state) => state.orders.orders);

  useEffect(() => {
    const rawToken = getCookie('accessToken');
    if (!rawToken) return;

    const token = rawToken.startsWith('Bearer ')
      ? rawToken.replace('Bearer ', '')
      : rawToken;

    const ws = new WebSocket(
      `wss://norma.nomoreparties.space/orders?token=${token}`
    );

    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      dispatch(setConnected(true));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WS message]', data);

        if (data?.success && Array.isArray(data.orders)) {
          dispatch(setOrders(data.orders));
        }
      } catch (err) {
        dispatch(setError('Ошибка при разборе WS-сообщения'));
      }
    };

    ws.onerror = () => {
      dispatch(setError('Ошибка WebSocket'));
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      dispatch(setConnected(false));
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
