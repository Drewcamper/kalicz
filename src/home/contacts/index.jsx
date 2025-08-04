import { styles } from './styles';

function Contacts({ handleContactClick }) {
  return (
    <div style={styles.contactBox}>
      <div style={styles.whiteBg}>
        <div style={styles.contacts}>
          <div style={styles.introduction}>
            Máté is a visual artist based in Budapest Hungary. He intrested in combine
            applied work with personal intrest and creating visual identity.
          </div>
          <div style={styles.refers}>
            <a href='mailto:matekalicz@gmail.com'>matekalicz@gmail.com</a>
            <a href='tel:+36309563018'>+36309563018</a>
            <a href='https://www.instagram.com/matekalicz' target='_blank'>
              @matekalicz
            </a>
          </div>
          <>Budapest, Hungary</>
        </div>
      </div>
      <div style={styles.close} onClick={handleContactClick}>
        <div style={styles.closeText}>Close</div>
      </div>
    </div>
  );
}

export default Contacts;
