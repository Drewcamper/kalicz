export const styles = {
  contactBox: {
    height: '100vh',
    display: 'flex',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    width: 'calc(100vw - 16px)',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  whiteBg: {
    padding: '8px 0px',
    width: '100%',
    maxWidth: '360px',
    height: 'auto',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },

  contacts: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    border: '1px solid black',
    boxSizing: 'border-box',
    padding: '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },

  introduction: {
    marginBottom: '24px',
  },
  refers: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '36px',
  },

  close: {
    cursor: 'pointer',
    textDecoration: 'none',
    height: '100%',
    width: 'calc(100% - 360px)',
    marginTop: '8px',
  },

  closeText: {
    position: 'relative',
    width: '50px',
    fontFamily: 'timesNewRoman',
  },
};
