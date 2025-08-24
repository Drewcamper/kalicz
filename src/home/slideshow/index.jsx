import { useState, useEffect, useRef } from 'react';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';
import { styles } from './styles';
import './slideshow.css';

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

  const encodeToBase64 = str => {
    return window.btoa(unescape(encodeURIComponent(str)));
  };

  const handleMouseMove = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;

    const cursorText = relativeX < rect.width / 2 ? '←' : '→';
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <text x="32" y="32" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="black">
          ${cursorText}
        </text>
      </svg>
    `;

    const cursorSVG = `data:image/svg+xml;base64,${encodeToBase64(svgString)}`;

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

  const currentImage = images[currentIndex];

  return (
    <div
      ref={containerRef}
      style={styles.container}
      className='slideshow-container'
      onMouseMove={handleMouseMove}
      onClick={handleClick}>
      <ImageComponent
        image={currentImage}
        style={{ ...styles.image, cursor: cursorStyle }}
      />
    </div>
  );
};
