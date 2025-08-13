import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';

function IndexPage() {
  const { images } = useImageContext();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '10px',
        padding: '20px',
        height: 'auto',
        overflowY: 'auto',
        alignItems: 'start',
      }}>
      {images?.map((image, index) => (
        <ImageComponent
          key={index}
          image={image}
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ))}
    </div>
  );
}

export default IndexPage;
