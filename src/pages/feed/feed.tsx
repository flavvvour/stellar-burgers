import { FC, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { FeedUI } from '@ui-pages';
import { Preloader } from '@ui';
import {
  setFeedOrders,
  setFeedConnected,
  setFeedError
} from '../../services/slices/feedSlice';
import { getFeedsApi } from '../../utils/burger-api';

export const Feed: FC = () => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket | null>(null);
  const { orders } = useAppSelector((state) => state.feed);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('wss://norma.nomoreparties.space/orders/all');
    socketRef.current = ws;

    ws.onopen = () => {
      dispatch(setFeedConnected(true));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.success && Array.isArray(data.orders)) {
          dispatch(setFeedOrders(data));
        }
      } catch (err) {
        dispatch(setFeedError('Ошибка обработки WebSocket-сообщения'));
      }
    };

    ws.onerror = () => {
      dispatch(setFeedError('Ошибка WebSocket-соединения'));
    };

    ws.onclose = () => {
      dispatch(setFeedConnected(false));
    };
  }, [dispatch]);

  const handleGetFeeds = async () => {
    try {
      const data = await getFeedsApi();
      dispatch(setFeedOrders(data));
    } catch (err) {
      console.error('Ошибка при ручной загрузке заказов', err);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connectWebSocket]);

  if (!orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
