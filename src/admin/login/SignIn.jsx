import React from 'react';
import { login } from './logIn';

const SignIn = ({ onLogin }) => {
  const handleLogin = async () => {
    const success = await login();
    if (success) {
      onLogin();
    }
  };

  return (
    <>
      <button onClick={handleLogin}>Sign In With Google</button>
    </>
  );
};

export default SignIn;
