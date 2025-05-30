import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { checkAuth } from '../../services/slices/authSlice';
import App from './app';

const AppInitializer = () => {
  const dispatch = useAppDispatch();
  const isAuthChecked = useAppSelector((state) => state.auth.isAuthChecked);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!isAuthChecked) {
    return null;
  }

  return <App />;
};

export default AppInitializer;
