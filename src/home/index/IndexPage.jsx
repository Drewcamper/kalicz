import { useState, useEffect, useRef, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';
import { AnimationObserver } from './animationObserver';
import { InfiniteScrollSentinel } from './infiniteScroll';
import './styles.css';

function IndexPage() {
  const { images, getOriginalForOrder, phoneView } = useImageContext();

  const [visibleImages, setVisibleImages] = useState([]);
  const [animatedIds, setAnimatedIds] = useState(new Set());
  const [originalUrls, setOriginalUrls] = useState({}); // Map of order -> original URL
  const [previewImage, setPreviewImage] = useState(null);

  const animationObserverRef = useRef(null);
  const infiniteScrollRef = useRef(null);
  const containerRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /* INITIALIZE visibleImages FROM LOADERS                              */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!images?.length) {
      return;
    }

    const displayCount = phoneView ? images.length : 6;

    // On initial load, show loaders immediately
    setVisibleImages(images.slice(0, displayCount));
    setAnimatedIds(new Set());

    if (animationObserverRef.current) {
      animationObserverRef.current.disconnect();
      animationObserverRef.current = null;
    }
  }, [images, phoneView]);

  /* ------------------------------------------------------------------ */
  /* ANIMATION HANDLERS                                                  */
  /* ------------------------------------------------------------------ */

  const handleAnimateEnter = useCallback(id => {
    setAnimatedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleAnimateExit = useCallback(id => {
    setAnimatedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /* LAZY-LOAD ORIGINAL IMAGE WHEN VISIBLE                              */
  /* ------------------------------------------------------------------ */

  const handleImageVisible = useCallback(
    element => {
      const order = parseInt(element.dataset.imageOrder, 10);
      if (isNaN(order)) {
        return;
      }

      // Check if already cached
      if (originalUrls[order]) {
        return; // Already loaded
      }

      // Get original image URL for this order and pass it to ImageComponent
      // The actual image binary is fetched only once by the <img> element
      const originalImage = getOriginalForOrder(order);
      if (originalImage?.url) {
        setOriginalUrls(prev => ({
          ...prev,
          [order]: originalImage.url,
        }));
      }
    },
    [getOriginalForOrder, originalUrls], // Include originalUrls to check cache
  );

  /* ------------------------------------------------------------------ */
  /* PHONE VIEW: LOAD ALL ORIGINALS                                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!phoneView || !visibleImages.length) return;

    const urls = {};
    for (const image of visibleImages) {
      if (!originalUrls[image.order]) {
        const original = getOriginalForOrder(image.order);
        if (original?.url) {
          urls[image.order] = original.url;
        }
      }
    }

    if (Object.keys(urls).length > 0) {
      setOriginalUrls(prev => ({ ...prev, ...urls }));
    }
  }, [phoneView, visibleImages, getOriginalForOrder]);

  /* ------------------------------------------------------------------ */
  /* INFINITE SCROLL                                                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (phoneView || !images.length || visibleImages.length >= images.length) {
      return;
    }

    if (!infiniteScrollRef.current) {
      infiniteScrollRef.current = new InfiniteScrollSentinel();
    }

    const container =
      containerRef.current?.querySelector('.my-masonry-grid') || containerRef.current;

    infiniteScrollRef.current.setupObserver(container, () => {
      setVisibleImages(prev => {
        const nextLength = Math.min(prev.length + 3, images.length);
        return images.slice(0, nextLength);
      });
    });

    return () => infiniteScrollRef.current?.disconnect();
  }, [images, visibleImages.length, phoneView]);

  /* ------------------------------------------------------------------ */
  /* ANIMATION OBSERVER                                                  */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (phoneView || !visibleImages.length) {
      animationObserverRef.current?.disconnect();
      animationObserverRef.current = null;
      return;
    }

    if (!animationObserverRef.current) {
      animationObserverRef.current = new AnimationObserver();
    }

    const items = document.querySelectorAll('.masonry-item[data-image-id]');
    items.forEach(item =>
      animationObserverRef.current.observe(item, {
        onEnter: handleAnimateEnter,
        onExit: handleAnimateExit,
        onVisible: handleImageVisible, // NEW: Lazy-load original when visible
      }),
    );
  }, [
    visibleImages,
    phoneView,
    handleAnimateEnter,
    handleAnimateExit,
    handleImageVisible,
  ]);

  /* ------------------------------------------------------------------ */
  /* CLEANUP                                                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      animationObserverRef.current?.disconnect();
      infiniteScrollRef.current?.disconnect();
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div ref={containerRef} style={{ padding: '20px', minHeight: '150vh' }}>
      {phoneView ? (
        visibleImages.map(image => (
          <div
            key={`${image.id}-loader`}
            className='phoneView-image-item'
            onClick={() => setPreviewImage(image)}>
            <ImageComponent image={image} originalUrl={originalUrls[image.order]} />
          </div>
        ))
      ) : (
        <div style={{ paddingTop: '28px' }}>
          <Masonry
            breakpointCols={3}
            className='my-masonry-grid'
            columnClassName='my-masonry-grid_column'>
            {visibleImages.map(image => {
              const id = `${image.id}`;
              return (
                <div
                  key={id}
                  data-image-id={id}
                  data-image-order={image.order}
                  className={`masonry-item ${
                    animatedIds.has(id) ? 'rise-animation' : ''
                  }`}
                  onClick={() => setPreviewImage(image)}>
                  <ImageComponent image={image} originalUrl={originalUrls[image.order]} />
                </div>
              );
            })}
          </Masonry>
        </div>
      )}

      {previewImage && (
        <div className='preview-overlay' onClick={() => setPreviewImage(null)}>
          <img
            src={originalUrls[previewImage.order] || previewImage.url}
            className='preview-image'
          />
        </div>
      )}
    </div>
  );
}

export default IndexPage;
