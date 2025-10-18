import './responsive.css';
import { styles } from './styles';

function Contacts({ handleContactClick }) {
  return (
    <div style={styles.contactBox}>
      <div style={styles.whiteBg} className='whiteBg'>
        <div style={styles.contacts} className='contacts'>
          <div style={styles.introduction}>
            Máté is visual artist based in Budapest, Hungary.
          </div>
          <div style={styles.introduction}>
            He combines applied work with a personal approach.{' '}
          </div>
          <div style={styles.refers}>
            <a href='mailto:matekalicz@gmail.com'>matekalicz@gmail.com</a>
            <a href='tel:+36309563018'>+36309563018</a>
            <a href='https://www.instagram.com/matekalicz' target='_blank'>
              @matekalicz
            </a>
          </div>
        </div>
      </div>
      <div style={styles.close} className='close' onClick={handleContactClick}>
        <div style={styles.closeText} className='closeText'>
          Close
        </div>
      </div>
    </div>
  );
}

export default Contacts;
