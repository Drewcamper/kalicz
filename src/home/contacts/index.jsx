import { Link } from 'react-router-dom';

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

const styles = {
  contactBox: {
    width: '30%',
    minWidth: '200px',
    height: '98%',
    padding: '.5%',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
  },
  close: {
    cursor: 'pointer',
    textDecoration: 'none',
    height: '24px',
  },
  contacts: {
    border: '1px solid lightgrey',
    boxSizing: 'border-box',
    padding: '12px',
    marginRight: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
  },
};
