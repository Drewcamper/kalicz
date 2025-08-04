import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ImageUpload from './upload/ImageUpload';
import { ShowImages } from './images/ShowImages';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import { styles } from './styles';

function AdminPage({ onLogout }) {
  const navigate = useNavigate();

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
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
      <div style={styles.content}>
        <ImageUpload />
        <ShowImages />
      </div>
    </div>
  );
}

export default AdminPage;

AdminPage.propTypes = {
  onLogout: PropTypes.func,
};
