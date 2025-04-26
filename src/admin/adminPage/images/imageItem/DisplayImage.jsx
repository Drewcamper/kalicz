function DisplayImage({ image }) {
  return (
    <img
      src={image.url}
      alt={image.name}
      style={styles.image}
      onError={e => (e.target.src = 'https://via.placeholder.com/150')}
    />
  );
}

const styles = {
  image: {
    maxWidth: '100%',
    maxHeight: '150px',
    marginBottom: '10px',
  },
};

export default DisplayImage;
