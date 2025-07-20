import { Link } from 'react-router-dom';

import { styles } from './styles';

function Contacts() {
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
      <Link to='/' style={styles.close}>
        Close
      </Link>
    </div>
  );
}

export default Contacts;
