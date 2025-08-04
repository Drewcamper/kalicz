import { useImageContext } from '../../context';

function IndexPage() {
  const { images } = useImageContext();

  return (
    <div style={{ height: '95vh', overflowY: 'scroll', marginBottom: '160px' }}>
      {images?.map(image => {
        return (
          <img
            key={image?.id}
            src={image?.url}
            alt={image?.name}
            style={{
              height: '100%',
              padding: '8px',
              transition: 'filter 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}

export default IndexPage;
