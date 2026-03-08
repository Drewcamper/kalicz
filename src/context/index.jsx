import { createContext, useContext, useEffect, useState } from 'react';
import { fetchImages } from '../admin/adminPage/images/services';
import { toast } from 'react-toastify';

const ImageContext = createContext();

// Helper function to preload images
const preloadImages = imageUrls => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    })
  );
};

export const ImageProvider = ({ children }) => {
  const [loaderImages, setLoaderImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [displayImages, setDisplayImages] = useState([]); // Images currently being displayed
  const [phoneView, setPhoneView] = useState(false);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);
  const [hasLoadedOriginal, setHasLoadedOriginal] = useState(false);
  const [originalImagesLoaded, setOriginalImagesLoaded] = useState(false);

  const orderImages = images => {
    return [...images].sort((a, b) => a.order - b.order);
  };

  const refetchImages = async () => {
    try {
      setIsLoadingOriginal(true);
      const fetchedImages = await fetchImages(false);
      const orderedImages = orderImages(fetchedImages);

      // Preload images before updating state
      await preloadImages(orderedImages.map(img => img.url));

      setOriginalImages(orderedImages);
      setDisplayImages(orderedImages);
      setHasLoadedOriginal(true);
      setOriginalImagesLoaded(true);
    } catch (error) {
      toast.error(error.message || 'Error refetching images');
    } finally {
      setIsLoadingOriginal(false);
    }
  };

  // Step 1: Fetch loader images immediately
  useEffect(() => {
    const loadLoaderImages = async () => {
      try {
        const loaderImages = await fetchImages(true);
        const orderedLoaderImages = orderImages(loaderImages);

        // Preload loader images too
        await preloadImages(orderedLoaderImages.map(img => img.url));

        setLoaderImages(orderedLoaderImages);
        setDisplayImages(orderedLoaderImages); // Start with loader images
      } catch (error) {
        toast.error(error.message || 'Error loading loader images');
      }
    };

    loadLoaderImages();
  }, []);

  // Step 2: Fetch and preload original images after loader images are displayed
  useEffect(() => {
    if (loaderImages.length === 0) return;

    const loadOriginalImages = async () => {
      setIsLoadingOriginal(true);
      try {
        // Fetch original images
        const originalImages = await fetchImages(false);
        const orderedOriginalImages = orderImages(originalImages);

        // Store original images but don't display yet
        setOriginalImages(orderedOriginalImages);
        setHasLoadedOriginal(true);

        // Preload all original images before switching
        await preloadImages(orderedOriginalImages.map(img => img.url));

        // Mark that original images are fully loaded
        setOriginalImagesLoaded(true);
      } catch (error) {
        toast.error(error.message || 'Error loading original images');
        setIsLoadingOriginal(false);
      }
    };

    // Start loading original images after loader images are displayed
    const timer = setTimeout(() => {
      loadOriginalImages();
    }, 500);

    return () => clearTimeout(timer);
  }, [loaderImages]);

  // Step 3: Switch to original images only after they're fully loaded
  useEffect(() => {
    if (originalImagesLoaded && originalImages.length > 0) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setDisplayImages([...originalImages]);
        setIsLoadingOriginal(false);

        // Reset the flag for future updates
        setOriginalImagesLoaded(false);
      }, 300);
    }
  }, [originalImagesLoaded, originalImages]);

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
        images: displayImages, // Use displayImages as the current images
        loaderImages,
        originalImages,
        phoneView,
        setPhoneView,
        refetchImages,
        isLoadingOriginal,
        hasLoadedOriginal,
      }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
