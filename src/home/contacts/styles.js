export const styles = {
  contactBox: {
    // width: '360px',
    height: 'calc(100vh - 36px)',
    display: 'flex',
    position: 'relative',
    top: 0,
    left: 0,
    zIndex: 100,
    width: 'calc(100vw - 16px)',
    // height: '100vh',
    backgroundColor: 'rgba(255,255,255,0.8)',
    margin: '32px 8px',
  },
  contacts: {
    width: '360px',
    border: '1px solid black',
    boxSizing: 'border-box',
    padding: '12px',
    // marginRight: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
  },
  close: {
    cursor: 'pointer',
    textDecoration: 'none',
    height: '100%',
    width: 'calc(100% - 360px)',
  },

  closeText: {
    position: 'relative',
    width: '50px',
    margin: '8px 0px 0px 8px',
  },
};
