import { FC } from 'react';
import { useAppSelector } from '../../services/store';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => (
  <AppHeaderUI
    userName={useAppSelector((state) => state.auth.user?.name || '')}
  />
);
