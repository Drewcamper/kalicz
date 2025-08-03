import { useState, useEffect } from 'react';
import { useImageContext } from '../../context';

import { styles } from './styles';

export const Slideshow = () => {
  const { images } = useImageContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorStyle, setCursorStyle] = useState('');

  const handleMouseMove = e => {
    const screenWidth = window.innerWidth;
    const cursorText = e.clientX < screenWidth / 2 ? 'Prev' : 'Next';
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

  const handleKeyDown = e => {
    if (e.key === 'ArrowRight') {
      goNext();
    } else if (e.key === 'ArrowLeft') {
      goPrev();
    }
  };

  const handleClick = e => {
    const middle = window.innerWidth / 2;
    if (e.clientX > middle) {
      goNext();
    } else {
      goPrev();
    }
  };

  const goNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length > 0) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
      };
    }
  }, [images]);

  if (images.length > 0) return <p>No images to display</p>;

  const currentImage = images[currentIndex];

  return (
    <div style={{ ...styles.container, cursor: cursorStyle }}>
      <div style={styles.imageWrapper}>
        <img src={currentImage.url} alt={currentImage.name} style={styles.image} />
        {/* <p style={styles.caption}>{currentImage.name}</p> */}
      </div>
    </div>
  );
};
