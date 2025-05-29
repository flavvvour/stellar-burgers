import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';

type ProtectedRouteProps = {
  children?: React.ReactElement;
  onlyUnAuth?: boolean;
};

export const ProtectedRoute = ({
  children,
  onlyUnAuth
}: ProtectedRouteProps) => {
  const { user, isAuthChecked } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthChecked) {
    console.log('Ждём авторизацию...');
    return <p>Загрузка авторизации...</p>;
  }

  if (onlyUnAuth && user) {
    return <Navigate to='/' replace />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to='/register' replace state={{ from: location }} />;
  }

  return children || <Outlet />;
};
