import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { setUser } from '../../services/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const Profile: FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [formValue, setFormValue] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const accessToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];

    if (!accessToken) {
      setUpdateError('Пользователь не авторизован');
      return;
    }

    try {
      const response = await fetch(
        'https://norma.nomoreparties.space/api/auth/user',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(formValue)
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Ошибка обновления профиля');
      }

      dispatch(setUser(data.user));

      setFormValue({
        name: data.user.name,
        email: data.user.email,
        password: ''
      });

      setUpdateError(null);
    } catch (error: any) {
      console.error('Ошибка при обновлении профиля:', error);
      setUpdateError(error.message || 'Ошибка при отправке запроса');
    }
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
      setUpdateError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) return null;

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateError ?? undefined}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
