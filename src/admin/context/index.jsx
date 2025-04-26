import { createContext, useContext, useEffect, useState } from 'react';
import { fetchImages } from '../adminPage/images/services';

import { toast } from 'react-toastify';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const getImages = async () => {
      try {
        const data = await fetchImages();
        setImages(data);
      } catch (error) {
        toast(error.message);
      }
    };

    getImages();
  }, []);

  return (
    <AdminContext.Provider value={{ images, setImages }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => useContext(AdminContext);
