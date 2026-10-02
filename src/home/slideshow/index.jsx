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

  // Slide transition: while `slide` is set, both the outgoing
  // (slide.fromIndex) and incoming (slide.toIndex, === currentIndex)
  // images render stacked and full-size, and `slideActive` flips one
  // frame later to animate both from their start position to 0 — the
  // outgoing sliding off in the direction of travel, the incoming
  // sliding in from the opposite side it's coming from.
  const [slide, setSlide] = useState(null);
  const [slideActive, setSlideActive] = useState(false);
  const slideRafRef = useRef(null);
  const slideTimeoutRef = useRef(null);
  const SLIDE_MS = 420;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Reset position if the underlying image pool changes identity
  // (e.g. CategoryPage mounted with a different category).
  useEffect(() => {
    setCurrentIndex(0);
    readyIndicesRef.current = new Set();
    setSlide(null);
    setSlideActive(false);
  }, [images]);

  // Drive the two-frame "start position painted, then animate to 0"
  // sequence, and clear the transition once it's finished.
  useEffect(() => {
    if (!slide) return undefined;

    setSlideActive(false);
    const raf1 = requestAnimationFrame(() => {
      slideRafRef.current = requestAnimationFrame(() => setSlideActive(true));
    });
    slideTimeoutRef.current = setTimeout(() => {
      setSlide(null);
      setSlideActive(false);
    }, SLIDE_MS + 40);

    return () => {
      cancelAnimationFrame(raf1);
      if (slideRafRef.current) cancelAnimationFrame(slideRafRef.current);
      clearTimeout(slideTimeoutRef.current);
    };
  }, [slide]);

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

  // Shared by goNext/goPrev: advances currentIndex and, when there's
  // more than one image to slide between, records the outgoing index
  // so the render below can animate both the old and new image.
  // Ignored while a transition is already in flight, so a rapid
  // double-click can't start a second animation out from under the
  // first one.
  const navigate = (computeNext, direction) => {
    if (slide) return;
    directionRef.current = direction;
    if (images.length < 2 || prefersReducedMotion) {
      setCurrentIndex(computeNext);
      return;
    }
    setCurrentIndex(prevIndex => {
      const nextIndex = computeNext(prevIndex);
      setSlide({ fromIndex: prevIndex, toIndex: nextIndex, direction });
      return nextIndex;
    });
  };

  const goNext = () => navigate(prev => (prev + 1) % images.length, 'forward');

  const goPrev = () => navigate(prev => (prev - 1 + images.length) % images.length, 'backward');

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
        const isSlideOutgoing = slide && idx === slide.fromIndex;
        const isSlideIncoming = slide && idx === slide.toIndex;
        // Defer rendering pool images until the current image's original
        // has loaded — except the two images actively sliding, which must
        // always render together or the outgoing one can get briefly
        // culled right as the transition starts (it isn't "current" the
        // instant currentIndex flips) and then mount straight into its
        // end position with nothing to animate from, snapping instead of
        // sliding.
        const currentIsReady = readyIndicesRef.current.has(currentIndex);
        if (!isCurrent && !currentIsReady && !isSlideOutgoing && !isSlideIncoming) return null;

        let itemStyle;
        if (isSlideOutgoing || isSlideIncoming) {
          // Forward: incoming enters from the right (+100% -> 0),
          // outgoing exits to the left (0 -> -100%). Backward: mirrored.
          const sign = slide.direction === 'forward' ? 1 : -1;
          const startX = isSlideIncoming ? sign * 100 : 0;
          const endX = isSlideIncoming ? 0 : -sign * 100;
          itemStyle = {
            position: 'absolute',
            inset: 0,
            zIndex: isSlideIncoming ? 2 : 1,
            visibility: image ? 'visible' : 'hidden',
            cursor: isSlideIncoming ? cursorStyle : 'default',
            transform: `translateX(${slideActive ? endX : startX}%)`,
            transition: `transform ${SLIDE_MS}ms cubic-bezier(0.45, 0, 0.2, 1)`,
          };
        } else {
          itemStyle = {
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
          };
        }

        return (
          <ImageComponent
            key={idx}
            image={image}
            originalUrl={getOriginalUrl(idx)}
            loading='eager'
            onOriginalLoad={() => handleOriginalLoad(idx)}
            style={itemStyle}
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
