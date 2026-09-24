import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { fetchImages } from '../admin/adminPage/images/services';
import { toast } from 'react-toastify';
import { DEFAULT_CATEGORY, CATEGORY_KEYS } from '../constants/categories';

const ImageContext = createContext();

const categoryOf = image => image?.category || DEFAULT_CATEGORY;

const orderImages = images => [...images].sort((a, b) => a.order - b.order);

// Group a flat array of image docs into { [category]: sortedImages[] }.
// Every known category key is always present (even if empty), so
// consumers never have to guard against `undefined`.
const groupByCategory = images => {
  const map = {};
  CATEGORY_KEYS.forEach(key => {
    map[key] = [];
  });
  images.forEach(image => {
    const key = categoryOf(image);
    if (!map[key]) map[key] = [];
    map[key].push(image);
  });
  CATEGORY_KEYS.forEach(key => {
    map[key] = orderImages(map[key]);
  });
  return map;
};

// Build a { [order]: image } lookup for one category's image array.
const buildLookupMap = images =>
  images.reduce((map, img) => {
    map[img.order] = img;
    return map;
  }, {});

export const ImageProvider = ({ children }) => {
  const [loaderImages, setLoaderImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [phoneView, setPhoneView] = useState(false);

  // Fetch all loader images as a batch on mount
  // (frontend will handle any order via lookup system)
  useEffect(() => {
    const loadLoaderImages = async () => {
      try {
        const loaders = await fetchImages(true);
        setLoaderImages(orderImages(loaders));
      } catch (error) {
        toast.error(error.message || 'Error loading loader images');
      }
    };

    loadLoaderImages();
  }, []);

  // Fetch all original images once (lazy-loaded per viewport item)
  useEffect(() => {
    const loadOriginalImages = async () => {
      try {
        const originals = await fetchImages(false);
        setOriginalImages(orderImages(originals));
      } catch (error) {
        toast.error(error.message || 'Error loading original images');
      }
    };

    loadOriginalImages();
  }, []);

  const refreshLoaderImages = async () => {
    try {
      const loaders = await fetchImages(true);
      setLoaderImages(orderImages(loaders));
    } catch (error) {
      toast.error(error.message || 'Error refreshing loader images');
    }
  };

  const refreshOriginalImages = async () => {
    try {
      const originals = await fetchImages(false);
      setOriginalImages(orderImages(originals));
    } catch (error) {
      toast.error(error.message || 'Error refreshing original images');
    }
  };

  /* -------------------- Per-category grouping -------------------- */

  const loaderImagesByCategory = useMemo(
    () => groupByCategory(loaderImages),
    [loaderImages],
  );
  const originalImagesByCategory = useMemo(
    () => groupByCategory(originalImages),
    [originalImages],
  );

  const loaderLookupByCategory = useMemo(() => {
    const map = {};
    CATEGORY_KEYS.forEach(key => {
      map[key] = buildLookupMap(loaderImagesByCategory[key] || []);
    });
    return map;
  }, [loaderImagesByCategory]);

  const originalLookupByCategory = useMemo(() => {
    const map = {};
    CATEGORY_KEYS.forEach(key => {
      map[key] = buildLookupMap(originalImagesByCategory[key] || []);
    });
    return map;
  }, [originalImagesByCategory]);

  /* -------------------- Get by order (category-aware) -------------------- */

  const getOriginalFor = (category, order) =>
    originalLookupByCategory[category || DEFAULT_CATEGORY]?.[order] || null;

  const getLoaderFor = (category, order) =>
    loaderLookupByCategory[category || DEFAULT_CATEGORY]?.[order] || null;

  // Backward-compatible single-category ("index") helpers — every
  // existing caller (Slideshow at "/", IndexPage at "/index", the
  // admin's DisplayImage default) keeps working unchanged.
  const getOriginalForOrder = order => getOriginalFor(DEFAULT_CATEGORY, order);
  const getLoaderForOrder = order => getLoaderFor(DEFAULT_CATEGORY, order);

  /* -------------------- Category-scoped setters -------------------- */
  // Used by the admin (upload / reorder / rename / delete) to update
  // local state optimistically without refetching everything. They
  // splice the given category's slice back into the flat state array
  // so every other category's images are left untouched.

  const setOriginalImagesForCategory = (category, updater) => {
    setOriginalImages(prev => {
      const current = prev.filter(img => categoryOf(img) === category);
      const rest = prev.filter(img => categoryOf(img) !== category);
      const nextForCategory =
        typeof updater === 'function' ? updater(current) : updater;
      return [...rest, ...nextForCategory];
    });
  };

  const setLoaderImagesForCategory = (category, updater) => {
    setLoaderImages(prev => {
      const current = prev.filter(img => categoryOf(img) === category);
      const rest = prev.filter(img => categoryOf(img) !== category);
      const nextForCategory =
        typeof updater === 'function' ? updater(current) : updater;
      return [...rest, ...nextForCategory];
    });
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
        // Legacy flat surface — defaults to the "index" category, so
        // every pre-existing consumer (Slideshow "/", IndexPage
        // "/index") needs zero changes.
        images: loaderImagesByCategory[DEFAULT_CATEGORY] || [],
        setImages: updater => setLoaderImagesForCategory(DEFAULT_CATEGORY, updater),
        originalImages: originalImagesByCategory[DEFAULT_CATEGORY] || [],
        setOriginalImages: updater =>
          setOriginalImagesForCategory(DEFAULT_CATEGORY, updater),
        getOriginalForOrder,
        getLoaderForOrder,

        // New category-aware surface
        loaderImagesByCategory,
        originalImagesByCategory,
        getOriginalFor,
        getLoaderFor,
        setOriginalImagesForCategory,
        setLoaderImagesForCategory,

        refreshLoaderImages,
        refreshOriginalImages,
        phoneView,
        setPhoneView,
      }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
