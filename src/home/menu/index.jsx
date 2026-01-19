import './styles.css';

export const Menu = ({ onContactClick }) => {
  const scrollToTop = () => {
     window.scrollTo({
       top: 0,
       behavior: 'smooth',
     });
  };

  return (
    <div className='container'>
      <a className='link' onClick={scrollToTop}>
        Mate Kalicz
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
