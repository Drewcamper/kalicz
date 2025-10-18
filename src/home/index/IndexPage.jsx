import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';

function IndexPage() {
  const { images } = useImageContext();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '16px',
        padding: '16px',
        height: '100vh',
        overflowY: 'auto',
        alignItems: 'start',
        boxSizing: 'border-box',
        paddingBottom: '60px',
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
