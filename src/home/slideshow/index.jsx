import { useState, useEffect, useRef } from 'react';
import { useImageContext } from '../../context';
import { styles } from './styles';

export const Slideshow = () => {
  const { images } = useImageContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorStyle, setCursorStyle] = useState('');
  const containerRef = useRef(null);

  const goNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleMouseMove = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;

    const cursorText = relativeX < rect.width / 2 ? 'Prev' : 'Next';
    const cursorSVG = `
      data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
          <text x="32" y="32" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="black">
            ${cursorText}
          </text>
        </svg>
      `)}
    `;
    setCursorStyle(`url(${cursorSVG}), auto`);
  };

  const handleClick = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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

  if (images.length < 1) return <p>Loading...</p>;

  const currentImage = images[currentIndex];

  return (
    <div
      ref={containerRef}
      style={{ ...styles.container, cursor: cursorStyle }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}>
      <div style={styles.imageWrapper}>
        <img src={currentImage?.url} alt={currentImage?.name} style={styles.image} />
      </div>
    </div>
  );
};
