// import { Link } from 'react-router-dom';

// import { styles } from './styles';

// export const Menu = () => {
//   return (
//     <div style={styles.container}>
//       <Link to='/' style={styles.link}>
//         Máté Kalicz
//       </Link>
//       <Link to='/index' style={styles.link}>
//         index
//       </Link>
//       <Link to='/contacts' style={styles.link}>
//         Contact
//       </Link>
//     </div>
//   );
// };

import { useNavigate, useLocation } from 'react-router-dom';
import { styles } from './styles';

export const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleContactClick = () => {
    navigate('/contacts', {
      state: { backgroundLocation: location },
    });
  };

  return (
    <div style={styles.container}>
      <a href='/' style={styles.link}>
        Máté Kalicz
      </a>
      <a href='/index' style={styles.link}>
        index
      </a>
      <button
        onClick={handleContactClick}
        style={{
          ...styles.link,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}>
        Contact
      </button>
    </div>
  );
};
