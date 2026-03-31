import { useImageContext } from '../../../../context';
import { styles } from './styles';

function DisplayImage({ image }) {
  const { getLoaderForOrder } = useImageContext();
  const loaderImage = getLoaderForOrder(image?.order);
  const displayUrl = loaderImage?.url || image?.url;

  return (
    <img
      src={displayUrl}
      alt={image?.name}
      style={styles.image}
      onError={e => (e.target.src = 'https://via.placeholder.com/150')}
    />
  );
}

export default DisplayImage;
