import { useState, useEffect, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';
import './styles.css';

function IndexPage() {
  const { images } = useImageContext();

  const [visibleImages, setVisibleImages] = useState([]);
  const [animatedIds, setAnimatedIds] = useState(() => new Set());
  const [previewImage, setPreviewImage] = useState(null);
  const [phoneView, setPhoneView] = useState(false);

  const sentinelRef = useRef(null);
  const scrollDirectionRef = useRef('down');
  const lastScrollYRef = useRef(0);
  const animationObserverRef = useRef(null);

  /* ----------------------------- Responsive ----------------------------- */

  useEffect(() => {
    const updateView = () => {
      setPhoneView(window.innerWidth <= 480);
    };

    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, []);

  /* ----------------------------- Scroll Direction ----------------------------- */

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollDirectionRef.current =
        currentScrollY > lastScrollYRef.current ? 'down' : 'up';
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ----------------------------- Initial Load ----------------------------- */

  useEffect(() => {
    if (!images?.length) return;
    setVisibleImages(images.slice(0, 6));
  }, [images]);

  /* ----------------------------- Infinite Scroll ----------------------------- */

  useEffect(() => {
    if (!images?.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleImages.length < images.length) {
          setVisibleImages(prev => images.slice(0, prev.length + 3));
        }
      },
      { rootMargin: '300px' }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [images, visibleImages.length]);

  /* ----------------------------- Animation Setup ----------------------------- */

  // Setup animation observer when images are visible and component is mounted
  useEffect(() => {
    // Skip if phone view or no images
    if (phoneView || !visibleImages.length) {
      if (animationObserverRef.current) {
        animationObserverRef.current.disconnect();
        animationObserverRef.current = null;
      }
      return;
    }

    // Clean up previous observer
    if (animationObserverRef.current) {
      animationObserverRef.current.disconnect();
    }

    // Create new observer
    animationObserverRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const id = entry.target.dataset.imageId;

          if (entry.isIntersecting) {
            // Animate when scrolling down
            if (scrollDirectionRef.current === 'down') {
              setAnimatedIds(prev => {
                const next = new Set(prev);
                next.add(id);
                return next;
              });
            }
          } else {
            // Remove animation when scrolling up
            if (scrollDirectionRef.current === 'up') {
              setAnimatedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px',
      }
    );

    // Need to wait for next tick to ensure DOM is rendered
    setTimeout(() => {
      // Observe all masonry items
      const masonryItems = document.querySelectorAll('.masonry-item');
      masonryItems.forEach(item => {
        if (item && animationObserverRef.current) {
          animationObserverRef.current.observe(item);
        }
      });
    }, 0);

    return () => {
      if (animationObserverRef.current) {
        animationObserverRef.current.disconnect();
        animationObserverRef.current = null;
      }
    };
  }, [visibleImages, phoneView]);

  /* ----------------------------- Render ----------------------------- */

  return (
    <div style={{ padding: '20px', minHeight: '150vh' }}>
      {phoneView ? (
        visibleImages.map((image, index) => (
          <div
            key={image.id || index}
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
            {visibleImages.map((image, index) => {
              const uniqueId = image.id || index;
              return (
                <div
                  key={uniqueId}
                  data-image-id={uniqueId}
                  className={`masonry-item ${
                    animatedIds.has(uniqueId) ? 'rise-animation' : ''
                  }`}
                  onClick={() => setPreviewImage(image)}>
                  <ImageComponent image={image} />
                </div>
              );
            })}
          </Masonry>

          {visibleImages.length < images.length && (
            <div ref={sentinelRef} style={{ height: 1, marginTop: 40 }} />
          )}
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
