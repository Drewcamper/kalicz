import { useState } from 'react';
import './styles.css';

export const ImageComponent = ({ image, originalUrl, style }) => {
  const [loadedUrl, setLoadedUrl] = useState(null);

  const isOriginalReady = originalUrl && loadedUrl === originalUrl;

  const handleContextMenu = e => e.preventDefault();
  const handleDragStart = e => e.preventDefault();

  return (
    <div
      className='image-component-wrapper'
      style={style}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}>
      <img src={image?.url} alt={image?.name || ''} className='image-component' />
      {originalUrl && (
        <img
          src={originalUrl}
          alt={image?.name || ''}
          className='image-component image-component--original'
          style={{ visibility: isOriginalReady ? 'visible' : 'hidden' }}
          onLoad={() => setLoadedUrl(originalUrl)}
        />
      )}
    </div>
  );
};
