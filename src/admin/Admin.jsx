import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SignIn from './login/SignIn';
import AdminPage from './adminPage/AdminPage';

import { ImageProvider } from '../context';

export const Admin = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsAuthorized(true);
  };

  return (
    <>
      {isAuthorized ? (
        <ImageProvider>
          <AdminPage onLogout={() => setIsAuthorized(false)} />
        </ImageProvider>
      ) : (
        <SignIn onLogin={handleLogin} />
      )}
    </>
  );
};

export default Admin;
