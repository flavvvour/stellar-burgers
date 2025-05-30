import { FC, SyntheticEvent, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/store';
import { RegisterUI } from '@ui-pages';
import { registerUser } from '../../services/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const Register: FC = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.auth.error);
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const result = await dispatch(
      registerUser({
        name: userName,
        email,
        password
      })
    );
    if (registerUser.fulfilled.match(result)) {
      navigate('/profile');
    }
  };

  return (
    <RegisterUI
      errorText={error || ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
