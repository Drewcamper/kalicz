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
    width: '100%',
    maxWidth: '320px',
    height: 'auto',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },

  contacts: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    padding: '17px 16px',
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
    width: '100%',
  },

  closeText: {
    position: 'relative',
    width: '50px',
    top: '4px',
    fontStyle: 'comorant-garamond',
  },
};
