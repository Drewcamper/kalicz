import { createContext, useContext, useEffect, useState } from 'react';
import { fetchImages } from '../admin/adminPage/images/services';
import { toast } from 'react-toastify';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [loaderFetched, setLoaderFetched] = useState(false); // ✅ Track loader readiness

  const orderImages = images => {
    return images.sort((a, b) => a.order - b.order);
  };

  const refetchImages = async () => {
    try {
      const fetchedImages = await fetchImages(true);
      setImages(() => orderImages(fetchedImages));
    } catch (error) {
      toast.error(error.message || 'Error refetching images');
    }
  };

  // Step 1: Fetch loader images
  useEffect(() => {
    const loadLoaderImages = async () => {
      try {
        const loaderImages = await fetchImages(true);
        setImages(() => orderImages(loaderImages));
        setLoaderFetched(true); // ✅ Trigger original fetch
      } catch (error) {
        toast.error(error.message || 'Error loading loader images');
      }
    };

    loadLoaderImages();
  }, []);

  // Step 2: Fetch original images only after loader images are set
  // useEffect(() => {
  //   if (!loaderFetched) return;

  //   const loadOriginalImages = async () => {
  //     try {
  //       const originalImages = await fetchImages(false);
  //       setImages(() => orderImages(originalImages));
  //     } catch (error) {
  //       toast.error(error.message || 'Error loading original images');
  //     }
  //   };

  //   loadOriginalImages();
  // }, [loaderFetched]); // ✅ Triggers only after loader images are fetched

  return (
    <ImageContext.Provider value={{ images, setImages, refetchImages }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
