import { useState } from 'react';
import './styles.css';

export const ImageComponent = ({ image, originalUrl, style }) => {
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [loaderSrc, setLoaderSrc] = useState(image?.url);
  const [loaderReady, setLoaderReady] = useState(true);

  // Detect when loader image src changes (navigation happened)
  const loaderChanged = image?.url !== loaderSrc;
  if (loaderChanged) {
    setLoaderSrc(image?.url);
    setLoaderReady(false);
    setLoadedUrl(null);
  }

  const isOriginalReady = originalUrl && loadedUrl === originalUrl;

  // Use loaderChanged to override stale loaderReady in this render frame
  const effectiveLoaderReady = loaderChanged ? false : loaderReady;

  // Keep old content visible until new loader is ready
  const showOriginalOverlay = isOriginalReady || !effectiveLoaderReady;

  const handleContextMenu = e => e.preventDefault();
  const handleDragStart = e => e.preventDefault();

  return (
    <div
      className='image-component-wrapper'
      style={style}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}>
      <img
        src={image?.url}
        className='image-component'
        loading='lazy'
        decoding='async'
        onLoad={() => {
          setLoaderReady(true);
        }}
      />
      {originalUrl && (
        <img
          src={originalUrl}
          className='image-component image-component--original'
          loading='lazy'
          decoding='async'
          style={{ visibility: showOriginalOverlay ? 'visible' : 'hidden' }}
          onLoad={() => {
            setLoadedUrl(originalUrl);
          }}
        />
      )}
    </div>
  );
};
