import { createContext, useContext, useEffect, useState } from 'react';
import { fetchImages } from '../admin/adminPage/images/services';
import { toast } from 'react-toastify';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [loaderImages, setLoaderImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [originalImagesLookup, setOriginalImagesLookup] = useState({});
  const [loaderImagesLookup, setLoaderImagesLookup] = useState({});
  const [phoneView, setPhoneView] = useState(false);

  const orderImages = images => {
    return [...images].sort((a, b) => a.order - b.order);
  };

  // Build lookup map from array of images: order -> image object
  const buildLookupMap = images => {
    return images.reduce((map, img) => {
      map[img.order] = img;
      return map;
    }, {});
  };

  // Fetch all loader images as a batch on mount
  // (frontend will handle any order via lookup system)
  useEffect(() => {
    const loadLoaderImages = async () => {
      try {
        const loaderImages = await fetchImages(true);
        const orderedLoaderImages = orderImages(loaderImages);
        setLoaderImages(orderedLoaderImages);
        setLoaderImagesLookup(buildLookupMap(orderedLoaderImages));
      } catch (error) {
        toast.error(error.message || 'Error loading loader images');
      }
    };

    loadLoaderImages();
  }, []);

  // Fetch all original images once (lazy-loaded per viewport item)
  // Build lookup map for fast retrieval by order field
  useEffect(() => {
    const loadOriginalImagesLookup = async () => {
      try {
        const originalImages = await fetchImages(false);
        const orderedOriginalImages = orderImages(originalImages);
        setOriginalImages(orderedOriginalImages);
        const lookup = buildLookupMap(orderedOriginalImages);
        setOriginalImagesLookup(lookup);
      } catch (error) {
        toast.error(error.message || 'Error loading original images');
      }
    };

    loadOriginalImagesLookup();
  }, []);

  /* -------------------- Get Original by Order -------------------- */

  const getOriginalForOrder = order => {
    return originalImagesLookup[order] || null;
  };

  const getLoaderForOrder = order => {
    return loaderImagesLookup[order] || null;
  };

  /* ----------------------------- Responsive ----------------------------- */

  useEffect(() => {
    const updateView = () => {
      setPhoneView(window.innerWidth <= 600);
    };

    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, []);

  return (
    <ImageContext.Provider
      value={{
        images: loaderImages,
        setImages: setLoaderImages,
        getOriginalForOrder,
        getLoaderForOrder,
        loaderImages,
        originalImages,
        setOriginalImages,
        phoneView,
        setPhoneView,
      }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
