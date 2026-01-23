import { useImageContext } from '../../context';
import './styles.css';

export const Menu = ({ onContactClick }) => {
  const { phoneView } = useImageContext();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className='container'>
      {phoneView ? (
        <a className='link' onClick={scrollToTop}>
          Mate Kalicz
        </a>
      ) : (
        <>
          <a href='/' className='link'>
            Mate Kalicz
          </a>
          <a href='/index' className='link'>
            Index
          </a>
        </>
      )}

      <a
        onClick={onContactClick}
        className='link'
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}>
        Information
      </a>
    </div>
  );
};
