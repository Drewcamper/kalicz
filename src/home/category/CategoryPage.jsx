import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-css';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';
import { Slideshow } from '../slideshow';
import { getCategoryLabel } from '../../constants/categories';
import './styles.css';

// One page shape shared by Event / Table / On Set: a section head
// (eyebrow + title + live slide counter), a slideshow of the
// category's images, and a grid of the same images below it.
function CategoryPage({ category, eyebrow }) {
  const { loaderImagesByCategory, getOriginalFor, phoneView } = useImageContext();
  const images = loaderImagesByCategory[category] || [];
  const label = getCategoryLabel(category);

  const [slidePos, setSlidePos] = useState({ index: 0, total: images.length });
  const [originalUrls, setOriginalUrls] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const gridRef = useRef(null);

  const getOriginalForOrder = useCallback(
    order => getOriginalFor(category, order),
    [category, getOriginalFor],
  );

  // Lazy-load originals for the grid as thumbnails scroll into view,
  // and trigger the same rise-in reveal the Index page uses — toggled
  // both ways (added on enter, removed on exit) so it replays every
  // time an image scrolls back into view, rather than firing once and
  // then leaving every image permanently visible no matter how far
  // you scroll back up.
  useEffect(() => {
    if (!images.length) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            entry.target.classList.remove('in-view');
            return;
          }
          entry.target.classList.add('in-view');

          const order = parseInt(entry.target.dataset.imageOrder, 10);
          if (isNaN(order)) return;
          const original = getOriginalForOrder(order);
          if (original?.url) {
            setOriginalUrls(prev =>
              prev[order] ? prev : { ...prev, [order]: original.url },
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: '120px 0px' },
    );

    const items = gridRef.current?.querySelectorAll('[data-image-order]') || [];
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, [images, getOriginalForOrder]);

  return (
    <div className='category-page'>
      <div className='section-head'>
        <div className='section-head-title'>
          <span className='eyebrow'>{eyebrow}</span>
          <h1>{label}</h1>
        </div>
        <span className='count'>
          {images.length > 0
            ? `${String(slidePos.index + 1).padStart(2, '0')} / ${String(
                slidePos.total,
              ).padStart(2, '0')}`
            : ''}
        </span>
      </div>

      {/* Phone: same header/section-head above, but the embedded
          slideshow is swapped for a plain scrollable feed (one image
          per row, big vertical gaps) — same pattern the Index page
          already uses on phone, instead of a swipeable carousel. */}
      {!phoneView && (
        <div className='category-slideshow'>
          <Slideshow
            images={images}
            getOriginalForOrder={getOriginalForOrder}
            embedded
            onIndexChange={(index, total) => setSlidePos({ index, total })}
          />
        </div>
      )}

      <div className='category-grid' ref={gridRef}>
        {phoneView ? (
          images.map((image, index) => (
            <div
              key={image.id}
              data-image-order={image.order}
              className='category-grid-item category-feed-item'
              style={{ '--d': `${index * 0.03}s` }}
              onClick={() => setPreviewImage(image)}>
              <ImageComponent image={image} originalUrl={originalUrls[image.order]} />
            </div>
          ))
        ) : (
          <Masonry
            breakpointCols={{ default: 3, 900: 2, 560: 1 }}
            className='category-masonry-grid'
            columnClassName='category-masonry-grid_column'>
            {images.map((image, index) => (
              <div
                key={image.id}
                data-image-order={image.order}
                className='category-grid-item'
                style={{ '--d': `${index * 0.03}s` }}
                onClick={() => setPreviewImage(image)}>
                <ImageComponent image={image} originalUrl={originalUrls[image.order]} />
              </div>
            ))}
          </Masonry>
        )}
      </div>

      {previewImage && (
        <div className='category-preview-overlay' onClick={() => setPreviewImage(null)}>
          <img
            src={originalUrls[previewImage.order] || previewImage.url}
            className='category-preview-image'
          />
        </div>
      )}
    </div>
  );
}

CategoryPage.propTypes = {
  category: PropTypes.string.isRequired,
  eyebrow: PropTypes.string,
};

export default CategoryPage;
