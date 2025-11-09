import { useState } from 'react';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';

function IndexPage() {
  const { images } = useImageContext();
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageClick = image => {
    setPreviewImage(image);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '20px',
        padding: '20px',
        height: '100vh',
        overflowY: 'auto',
        alignItems: 'start',
        boxSizing: 'border-box',
        paddingBottom: '60px',
      }}>
      {images?.map((image, index) => (
        <div
          key={index}
          onClick={() => handleImageClick(image)}
          style={{ cursor: 'pointer' }}>
          <ImageComponent
            image={image}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      ))}

      {previewImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <img
            src={previewImage.url}
            alt='Preview'
            onClick={handleClosePreview}
            style={{
              maxHeight: '90%',
              cursor: 'pointer',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default IndexPage;
