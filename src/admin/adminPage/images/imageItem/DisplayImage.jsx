import { styles } from './styles';

function DisplayImage({ image }) {
  console.log('DisplayImage component rendered with image:', image);
  return (
    <img
      src={image?.url}
      alt={image?.name}
      style={styles.image}
      onError={e => (e.target.src = 'https://via.placeholder.com/150')}
    />
  );
}

export default DisplayImage;
