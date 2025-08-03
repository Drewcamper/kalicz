// import { createContext, useContext, useEffect, useState } from 'react';
// import { fetchImages } from '../admin/adminPage/images/services';

// import { toast } from 'react-toastify';

// const ImageContext = createContext();

// export const ImageProvider = ({ children }) => {
//   const [images, setImages] = useState([]);

//   useEffect(() => {
//     const getImages = async () => {
//       try {
//         const loaderImages = await fetchImages(false);
//         setImages(loaderImages);

//         const originalImages = await fetchImages(true);
//         if (originalImages?.length) {
//           setImages(originalImages);
//         }
//       } catch (error) {
//         toast(error.message);
//       }
//     };

//     getImages();
//   }, []);

//   return (
//     <ImageContext.Provider value={{ images, setImages }}>
//       {children}
//     </ImageContext.Provider>
//   );
// };

// export const useImageContext = () => useContext(ImageContext);

// import { createContext, useContext, useEffect, useState } from 'react';
// import { fetchImages } from '../admin/adminPage/images/services';
// import { toast } from 'react-toastify';
// const ImageContext = createContext();

// export const ImageProvider = ({ children }) => {
//   const [imagesByOrder, setImagesByOrder] = useState({}); // { [order]: { loader, original } }

//   useEffect(() => {
//     const loadImages = async () => {
//       try {
//         const loaderImages = await fetchImages(true);
//         console.log('Loader images fetched:', loaderImages);

//         const initialMap = {};
//         loaderImages.forEach(img => {
//           initialMap[img.order] = { loader: img };
//         });
//         setImagesByOrder(initialMap);

//         // Step 2: Load original images next and merge
//         const originalImages = await fetchImages(false);
//         console.log('Original images fetched:', originalImages);

//         setImagesByOrder(prev => {
//           const updated = { ...prev };
//           originalImages.forEach(img => {
//             if (updated[img.order]) {
//               updated[img.order].original = img;
//             } else {
//               updated[img.order] = { original: img };
//             }
//           });
//           return updated;
//         });
//       } catch (error) {
//         toast.error(error.message || 'Error loading images');
//       }
//     };

//     loadImages();
//   }, []);

//   return (
//     <ImageContext.Provider value={{ imagesByOrder, setImagesByOrder }}>
//       {children}
//     </ImageContext.Provider>
//   );
// };

// export const useImageContext = () => useContext(ImageContext);

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

  // Step 1: Fetch loader images
  useEffect(() => {
    const loadLoaderImages = async () => {
      try {
        const loaderImages = await fetchImages(true);
        setImages(() => orderImages(loaderImages));
        setLoaderFetched(true); // ✅ Trigger original fetch
        console.log('Loader images fetched:', loaderImages);
      } catch (error) {
        toast.error(error.message || 'Error loading loader images');
      }
    };

    loadLoaderImages();
  }, []);

  // Step 2: Fetch original images only after loader images are set
  useEffect(() => {
    if (!loaderFetched) return;

    const loadOriginalImages = async () => {
      try {
        const originalImages = await fetchImages(false);
        setImages(() => orderImages(originalImages));
        console.log('Original images fetched:', originalImages);
      } catch (error) {
        toast.error(error.message || 'Error loading original images');
      }
    };

    loadOriginalImages();
  }, [loaderFetched]); // ✅ Triggers only after loader images are fetched

  return (
    <ImageContext.Provider value={{ images, setImages }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
