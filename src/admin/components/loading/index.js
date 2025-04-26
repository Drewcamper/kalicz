export const Spinner = () => {
  return (
    <div id='spinner' style={styles}>
      Loading...
    </div>
  );
};

export const showSpinner = () => {
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'block';
};

export const hideSpinner = () => {
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'none';
};

const styles = {
  display: 'none',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'rgba(0, 0, 0, 0.75)',
  color: 'white',
  padding: '1rem',
  borderRadius: '4px',
  fontSize: '1.2rem',
  zIndex: '9999',
};
