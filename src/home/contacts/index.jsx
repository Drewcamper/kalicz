import { styles } from './styles';

function Contacts({ handleContactClick }) {
  return (
    <div style={styles.contactBox}>
      <div style={styles.contacts}>
        <>
          Máté is a visual artist from Hungary, Budapest. He intrested in combine applied
          work with personal intrest and creating visual identity.
        </>
        <a href='mailto:matekalicz@gmail.com'>matekalicz@gmail.com</a>
        <a href='tel:+36309563018'>+36309563018</a>
        <a href='https://www.instagram.com/matekalicz' target='_blank'>
          @matekalicz
        </a>

        <>Budapest, Hungary</>
      </div>
      <div style={styles.close} onClick={handleContactClick}>
        <div style={styles.closeText}>Close</div>
      </div>
    </div>
  );
}

export default Contacts;
