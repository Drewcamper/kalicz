import { styles } from './styles';

export const Menu = ({ onContactClick }) => {
  return (
    <div style={styles.container}>
      <a href='/' style={styles.link}>
        Máté Kalicz
      </a>
      <a href='/index' style={styles.link}>
        index
      </a>
      <button
        onClick={onContactClick}
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
