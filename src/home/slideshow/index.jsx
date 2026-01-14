import { useState, useEffect, useRef } from 'react';
import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';
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
        style={{
          ...styles.image,
          cursor: cursorStyle,
          height: currentImage?.originalHeight,
          visibility: currentImage ? 'visible' : 'hidden',
        }}
      />
    </div>
  );
};
