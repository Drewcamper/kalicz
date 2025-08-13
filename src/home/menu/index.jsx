// import { styles } from './styles';
import './styles.css';

export const Menu = ({ onContactClick }) => {
  return (
    <div className='container'>
      <a href='/' className='link'>
        Máté Kalicz
      </a>
      <a href='/index' className='link'>
        Index
      </a>
      <a
        onClick={onContactClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        className='link'>
        Information
      </a>
    </div>
  );
};
