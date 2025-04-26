import { Link } from 'react-router-dom';
export const Menu = () => {
  return (
    <div style={styles.container}>
      <Link to='/' style={styles.link}>
        Máté Kalicz
      </Link>
      <Link to='/index' style={styles.link}>
        index
      </Link>
      <Link to='/contacts' style={styles.link}>
        Contact
      </Link>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    padding: '6px',
  },
  link: {
    marginRight: '18px',
    textDecoration: 'none',
  },
};
