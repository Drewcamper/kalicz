import { Link, NavLink } from 'react-router-dom';
import { useImageContext } from '../../context';
import { CATEGORIES } from '../../constants/categories';
import './styles.css';

export const Menu = ({ onContactClick }) => {
  const { phoneView } = useImageContext();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // "Index" already has its own dedicated wordmark ("Máté Kalicz" ->
  // slideshow) / "Index" split on desktop; on phone both collapse
  // onto "/", so the separate Index link is only shown on desktop.
  const navCategories = CATEGORIES.filter(c => c.key !== 'index');

  return (
    <div className='container'>
      <Link to='/' className='word' onClick={scrollToTop}>
        Máté Kalicz
      </Link>

      {!phoneView && (
        <NavLink
          to='/index'
          className={({ isActive }) => `link${isActive ? ' active' : ''}`}>
          Index
        </NavLink>
      )}

      {navCategories.map(({ key, label, path }) => (
        <NavLink
          key={key}
          to={path}
          className={({ isActive }) => `link${isActive ? ' active' : ''}`}>
          {label}
        </NavLink>
      ))}

      <a onClick={onContactClick} className='link info-link'>
        Information
      </a>
    </div>
  );
};
