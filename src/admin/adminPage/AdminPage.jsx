import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ImageUpload from './upload/ImageUpload';
import { ShowImages } from './images/ShowImages';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import { styles } from './styles';

function AdminPage({ onLogout }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleUpload = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      toast('Error logging out:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.buttons}>
        <button onClick={() => navigate('/')} style={styles.homeButton}>
          Home
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
      <div style={styles.content}>
        <ImageUpload onUpload={handleUpload} />
        <ShowImages key={refreshKey} />
      </div>
    </div>
  );
}

export default AdminPage;

AdminPage.propTypes = {
  onLogout: PropTypes.func,
};
