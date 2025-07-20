export const styles = {
  contactBox: {
    // width: '360px',
    // height: 'calc(100vh - 16px)',
    // padding: '8px 0px',
    // display: 'flex',
    // flexDirection: 'row',
    // position: 'relative',

    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255,255,255,0.95)', // or darker if modal feel
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  close: {
    cursor: 'pointer',
    textDecoration: 'none',
    height: '24px',
  },
  contacts: {
    border: '1px solid black',
    boxSizing: 'border-box',
    padding: '12px',
    marginRight: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
  },
};
