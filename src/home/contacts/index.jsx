import './responsive.css';
import { styles } from './styles';

function Contacts({ handleContactClick }) {
  return (
    <div className='info-scrim' style={styles.scrim} onClick={handleContactClick}>
      <div
        className='info-panel'
        style={styles.panel}
        onClick={e => e.stopPropagation()}>
        <div className='close' style={styles.close} onClick={handleContactClick}>
          <span className='closeText'>Close</span>
        </div>

        <p style={styles.introduction}>
          Máté Kalicz is a visual artist based in Budapest, Hungary.
        </p>
        <p style={styles.introduction}>He combines applied work with a personal approach.</p>

        <div style={styles.refers} className='refers'>
          <a href='mailto:matekalicz@gmail.com'>matekalicz@gmail.com</a>
          <a href='tel:+36309563018'>+36309563018</a>
          <a href='https://www.instagram.com/matekalicz' target='_blank' rel='noopener noreferrer'>
            @matekalicz
          </a>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
