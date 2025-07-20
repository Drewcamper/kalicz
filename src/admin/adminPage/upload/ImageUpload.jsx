import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { styles } from './styles';

import { handleUpload } from './utils';
import { fetchImages } from '../images/services';

const ImageUpload = ({ onUpload }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [progress, setProgress] = useState({});
  const [maxOrder, setMaxOrder] = useState(0);

  useEffect(() => {
    const loadMaxOrder = async () => {
      const order = await fetchImages();
      setMaxOrder(order);
    };
    loadMaxOrder();
  }, []);

  const handleDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast('Only image and video files are allowed.');
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedImages(acceptedFiles);
      acceptedFiles.forEach((file, index) => {
        handleUpload({ file, index, maxOrder, onUpload, setProgress });
      });
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
        <p>Drag &apos;n&apos; drop images or videos here, or click to select them</p>
      </div>
      {selectedImages.length > 0 && (
        <div style={styles.scrollableContainer}>
          {selectedImages.map((file, index) => (
            <div key={index} style={styles.imageContainer}>
              <p>{file.name}</p>
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
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
