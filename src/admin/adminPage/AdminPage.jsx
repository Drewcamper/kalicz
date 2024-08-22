// import React, { useState } from 'react';
// import { getAuth, signOut } from 'firebase/auth';
// import ImageUpload from './upload/ImageUpload';
// import { ShowImages } from './images/ShowImages';

// function AdminPage({ onLogout }) {
//   const [refreshKey, setRefreshKey] = useState(0);

//   const handleUpload = () => {
//     setRefreshKey(prevKey => prevKey + 1); // Trigger re-render
//   };

//   const handleLogout = async () => {
//     const auth = getAuth();
//     try {
//       await signOut(auth);
//       onLogout();
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <button onClick={handleLogout} style={styles.logoutButton}>
//         Logout
//       </button>
//       <div style={styles.content}>
//         <ImageUpload onUpload={handleUpload} />
//         <ShowImages key={refreshKey} />
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     display: 'flex',
//     flexDirection: 'column',
//     height: '100%',
//     width: '100%',
//   },
//   logoutButton: {
//     alignSelf: 'flex-end',
//     padding: '10px 20px',
//     margin: '10px',
//     backgroundColor: 'blue',
//     color: 'white',
//     border: 'none',
//     borderRadius: '5px',
//     cursor: 'pointer',
//   },
//   content: {
//     display: 'flex',
//     height: '100%',
//     width: '100%',
//   },
// };

// export default AdminPage;

import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ImageUpload from './upload/ImageUpload';
import { ShowImages } from './images/ShowImages';

function AdminPage({ onLogout }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate(); // Create navigate function

  const handleUpload = () => {
    setRefreshKey(prevKey => prevKey + 1); // Trigger re-render
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const goToHome = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <div style={styles.container}>
      <div style={styles.buttons}>
        {' '}
        <button onClick={goToHome} style={styles.homeButton}>
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '10px',
  },
  logoutButton: {
    alignSelf: 'flex-end',
    padding: '10px 20px',
    margin: '10px',
    backgroundColor: 'blue',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  homeButton: {
    alignSelf: 'flex-end',
    padding: '10px 20px',
    margin: '10px',
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
};

export default AdminPage;
