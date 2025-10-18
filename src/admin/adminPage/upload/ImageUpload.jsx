import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { styles } from './styles';
import { fetchCollection } from '../../../services';
import { handleUpload, getMaxOrder } from './utils'; // Import getMaxOrder
import { useImageContext } from '../../../context/index';

const ImageUpload = ({ onUpload }) => {
  const { images, setImages } = useImageContext();
  const [selectedImages, setSelectedImages] = useState([]);
  const [progress, setProgress] = useState({});
  const [maxOrder, setMaxOrder] = useState(0);

  useEffect(() => {
    // Calculate the actual maximum order number from existing images
    const calculateMaxOrder = () => {
      if (images.length === 0) {
        setMaxOrder(0);
        return;
      }
      const currentMaxOrder = getMaxOrder(images);
      setMaxOrder(currentMaxOrder);
    };
    calculateMaxOrder();
  }, [images]);

  const refetch = async () => {
    const newImages = await fetchCollection(false);
    setImages(newImages);
  };

  const handleDrop = async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Only image files are allowed.');
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedImages(acceptedFiles);

      // Process files sequentially to maintain correct order numbering
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        await handleUpload({
          file,
          index: i,
          images, // Pass the current images array
          onUpload: () => {
            onUpload?.();
          },
          setProgress,
          refetch,
        });
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': [],
    },
    multiple: true,
  });

  return (
    <div style={styles.container}>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        <p>Drag &apos;n&apos; drop images here, or click to select them</p>
      </div>
      {selectedImages.length > 0 && (
        <div style={styles.scrollableContainer}>
          {selectedImages.map((file, index) => (
            <div key={index} style={styles.imageContainer}>
              <p>{file?.name}</p>
              <img
                src={URL?.createObjectURL(file)}
                alt={file?.name}
                style={{ width: '90%' }}
              />
              {progress[index] || 0}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
