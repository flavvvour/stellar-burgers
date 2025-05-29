import { useEffect } from 'react';
import { useAppDispatch } from '../../services/store';
import { checkAuth } from '../../services/slices/authSlice';
import App from './app';

const AppInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('AppInitializer: dispatch checkAuth');
    dispatch(checkAuth());
  }, [dispatch]);

  return <App />;
};

export default AppInitializer;
