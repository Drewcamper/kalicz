import { useImageContext } from '../../../../context';
import { DEFAULT_CATEGORY } from '../../../../constants/categories';
import { styles } from './styles';

function DisplayImage({ image }) {
  const { getLoaderFor } = useImageContext();
  const loaderImage = getLoaderFor(image?.category || DEFAULT_CATEGORY, image?.order);
  const displayUrl = loaderImage?.url || image?.url;

  return (
    <img
      src={displayUrl}
      style={styles.image}
      onError={e => (e.target.src = 'https://via.placeholder.com/150')}
    />
  );
}

export default DisplayImage;
