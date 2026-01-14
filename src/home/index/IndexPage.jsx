import { useState, useEffect, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';
import './styles.css';

function IndexPage() {
  const { images } = useImageContext();
  const [visibleImages, setVisibleImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const sentinelRef = useRef(null);
  const initialDelayDoneRef = useRef(false);

  // Load first 3 images immediately
  useEffect(() => {
    if (!images || images.length === 0) return;

    setVisibleImages(images.slice(0, 3));

    const timer = setTimeout(() => {
      setVisibleImages(images.slice(0, 6));
      initialDelayDoneRef.current = true;
    }, 1000);

    return () => clearTimeout(timer);
  }, [images]);

  // Infinite scroll (after initial delay is done)
  useEffect(() => {
    if (!sentinelRef.current || !images) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && initialDelayDoneRef.current) {
          setVisibleImages(prev => images.slice(0, prev.length + 3));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [images]);

  return (
    <div style={{ padding: '20px', minHeight: '150vh' }}>
      <Masonry
        breakpointCols={3}
        className='my-masonry-grid'
        columnClassName='my-masonry-grid_column'>
        {visibleImages.map((image, index) => (
          <div
            key={index}
            className='masonry-item rise-animation'
            onClick={() => setPreviewImage(image)}>
            <ImageComponent image={image} />
          </div>
        ))}
      </Masonry>

      <div ref={sentinelRef} style={{ height: '1px' }} />

      {previewImage && (
        <div className='preview-overlay' onClick={() => setPreviewImage(null)}>
          <img src={previewImage.url} alt='Preview' className='preview-image' />
        </div>
      )}
    </div>
  );
}

export default IndexPage;
