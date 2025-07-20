import { useImageContext } from '../../context';

function IndexPage() {
  const { images } = useImageContext();
  console.log(images);

  return (
    <div style={{ height: '100vh', overflowY: 'scroll' }}>
      {images.map(image => (
        <img
          key={image.id}
          src={image.url}
          alt={image.name}
          style={{ height: '90vh', padding: '8px' }}
        />
      ))}
    </div>
  );
}

export default IndexPage;
