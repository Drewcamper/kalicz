import { createContext, useContext, useEffect, useState } from 'react';
import { fetchImages } from '../admin/adminPage/images/services';

import { toast } from 'react-toastify';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const getImages = async () => {
      try {
        const loaderImages = await fetchImages(false);
        setImages(loaderImages);

        const originalImages = await fetchImages(true);
        if (originalImages?.length) {
          setImages(originalImages);
        }
      } catch (error) {
        toast(error.message);
      }
    };

    getImages();
  }, []);

  return (
    <ImageContext.Provider value={{ images, setImages }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
