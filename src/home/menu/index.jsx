import { styles } from './styles';

export const Menu = ({ onContactClick }) => {
  return (
    <div style={styles.container}>
      <a href='/' style={styles.link}>
        Máté Kalicz
      </a>
      <a href='/index' style={styles.linkFont}>
        index
      </a>
      <a
        onClick={onContactClick}
        style={{
          ...styles.linkFont,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}>
        Contact
      </a>
    </div>
  );
};
