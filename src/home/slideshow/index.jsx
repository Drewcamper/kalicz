import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';
import { styles } from './styles';

// `images` / `getOriginalForOrder` are optional overrides: pass them to
// reuse this same slideshow (cursor hints, prefetch pool, keyboard nav)
// scoped to one category — e.g. from CategoryPage, which also listens
// via `onIndexChange` to show its own "n / total" counter in its
// section head. Left unset, it behaves exactly as before: the
// site-wide "/" slideshow over the default ("index") image pool from
// context.
export const Slideshow = ({
  images: imagesProp,
  getOriginalForOrder: getOriginalForOrderProp,
  embedded = false,
  onIndexChange,
}) => {
  const context = useImageContext();
  const images = imagesProp || context.images;
  const getOriginalForOrder = getOriginalForOrderProp || context.getOriginalForOrder;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorStyle, setCursorStyle] = useState('');
  const containerRef = useRef(null);
  const directionRef = useRef('forward');
  const readyIndicesRef = useRef(new Set());
  const [, forceUpdate] = useState(0);

  // Reset position if the underlying image pool changes identity
  // (e.g. CategoryPage mounted with a different category).
  useEffect(() => {
    setCurrentIndex(0);
    readyIndicesRef.current = new Set();
  }, [images]);

  useEffect(() => {
    onIndexChange?.(currentIndex, images.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, images.length]);

  const handleOriginalLoad = useCallback(idx => {
    if (!readyIndicesRef.current.has(idx)) {
      readyIndicesRef.current.add(idx);
      forceUpdate(n => n + 1);
    }
  }, []);

  const getOriginalUrl = index => {
    const img = images[index];
    if (!img?.order) return null;
    return getOriginalForOrder(img.order)?.url || null;
  };

  const goNext = () => {
    directionRef.current = 'forward';
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const goPrev = () => {
    directionRef.current = 'backward';
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const encodeToBase64 = str => {
    return window.btoa(unescape(encodeURIComponent(str)));
  };

  const handleMouseMove = () => {
    if (!containerRef.current) return;

    const cursorTextRight = '˃'; // U+02C3
    const cursorTextLeft = '˂'; // U+02C2
    const cursorPosition =
      window.event.clientX - containerRef.current.getBoundingClientRect().left;
    const cursorText =
      cursorPosition > containerRef.current.clientWidth / 2
        ? cursorTextRight
        : cursorTextLeft;
    const svgSize = 24;
    const fontSize = 18;

    const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
      <text x="${svgSize / 2}" y="${
        svgSize / 2
      }" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}" fill="black">
        ${cursorText}
      </text>
    </svg>
  `;

    const cursorSVG = `data:image/svg+xml;base64,${encodeToBase64(svgString)}`;

    setCursorStyle(`url(${cursorSVG}) ${svgSize / 2} ${svgSize / 2}, auto`);
  };

  const handleClick = e => {
    if (!containerRef.current) return;

    if (e.target.tagName !== 'IMG') return;

    const rect = e.target.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;

    if (relativeX > rect.width / 2) {
      goNext();
    } else {
      goPrev();
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images]);

  // Pool: current image + 1 behind (buffer) + 3 ahead in direction of travel.
  // Non-current ones are hidden with opacity:0 so their <img> tags
  // load images without being visible. When navigating, the
  // already-mounted component (same React key) becomes visible
  // instantly — zero re-fetching.
  const PREFETCH_AHEAD = 3;
  const len = images.length;
  const poolIndices = [];
  if (len > 0) {
    const wrap = i => ((i % len) + len) % len;
    const isForward = directionRef.current === 'forward';
    // 1 image behind (opposite of travel direction)
    poolIndices.push(wrap(currentIndex + (isForward ? -1 : 1)));
    // Current
    poolIndices.push(currentIndex);
    // 3 ahead in travel direction
    for (let i = 1; i <= PREFETCH_AHEAD; i++) {
      const idx = wrap(currentIndex + (isForward ? i : -i));
      if (!poolIndices.includes(idx)) poolIndices.push(idx);
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        ...styles.container,
        ...(embedded ? styles.embeddedContainer : {}),
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}>
      {poolIndices.map(idx => {
        const image = images[idx];
        const isCurrent = idx === currentIndex;
        // Defer rendering pool images until the current image's original has loaded
        const currentIsReady = readyIndicesRef.current.has(currentIndex);
        if (!isCurrent && !currentIsReady) return null;
        return (
          <ImageComponent
            key={idx}
            image={image}
            originalUrl={getOriginalUrl(idx)}
            loading='eager'
            onOriginalLoad={() => handleOriginalLoad(idx)}
            style={{
              ...styles.image,
              ...(isCurrent
                ? {
                    cursor: cursorStyle,
                    visibility: image ? 'visible' : 'hidden',
                  }
                : {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                  }),
            }}
          />
        );
      })}
    </div>
  );
};

Slideshow.propTypes = {
  images: PropTypes.array,
  getOriginalForOrder: PropTypes.func,
  embedded: PropTypes.bool,
  onIndexChange: PropTypes.func,
};
