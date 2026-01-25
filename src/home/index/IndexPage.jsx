import { useState, useEffect, useRef, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';
import { AnimationObserver } from './animationObserver';
import { InfiniteScrollSentinel } from './infiniteScroll';
import './styles.css';

function IndexPage() {
  const { images, phoneView, isLoadingOriginal, hasLoadedOriginal } = useImageContext();

  const [visibleImages, setVisibleImages] = useState([]);
  const [animatedIds, setAnimatedIds] = useState(new Set());
  const [previewImage, setPreviewImage] = useState(null);

  const animationObserverRef = useRef(null);
  const infiniteScrollRef = useRef(null);
  const containerRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /* RESET visibleImages WHEN ORIGINALS LOAD                             */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!images?.length) return;

    // Loader → Original transition
    if (hasLoadedOriginal && !isLoadingOriginal) {
      setVisibleImages(images.slice(0, phoneView ? images.length : 6));
      setAnimatedIds(new Set());

      if (animationObserverRef.current) {
        animationObserverRef.current.disconnect();
        animationObserverRef.current = null;
      }
    }
  }, [images, hasLoadedOriginal, isLoadingOriginal, phoneView]);

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
  /* INFINITE SCROLL                                                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (
      phoneView ||
      isLoadingOriginal ||
      !images.length ||
      visibleImages.length >= images.length
    ) {
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
  }, [images, visibleImages.length, phoneView, isLoadingOriginal]);

  /* ------------------------------------------------------------------ */
  /* ANIMATION OBSERVER                                                  */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (phoneView || isLoadingOriginal || !visibleImages.length) {
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
      })
    );
  }, [
    visibleImages,
    phoneView,
    isLoadingOriginal,
    handleAnimateEnter,
    handleAnimateExit,
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
            key={`${image.id}-${isLoadingOriginal ? 'loader' : 'original'}`}
            className='phoneView-image-item'
            onClick={() => setPreviewImage(image)}>
            <ImageComponent image={image} />
          </div>
        ))
      ) : (
        <div style={{ paddingTop: '28px' }}>
          <Masonry
            breakpointCols={3}
            className='my-masonry-grid'
            columnClassName='my-masonry-grid_column'>
            {visibleImages.map(image => {
              const id = `${image.id}-${isLoadingOriginal ? 'loader' : 'original'}`;
              return (
                <div
                  key={id}
                  data-image-id={id}
                  className={`masonry-item ${
                    animatedIds.has(id) ? 'rise-animation' : ''
                  }`}
                  onClick={() => setPreviewImage(image)}>
                  <ImageComponent image={image} />
                </div>
              );
            })}
          </Masonry>
        </div>
      )}

      {previewImage && (
        <div className='preview-overlay' onClick={() => setPreviewImage(null)}>
          <img src={previewImage.url} alt='Preview' className='preview-image' />
        </div>
      )}
    </div>
  );
}

export default IndexPage;
