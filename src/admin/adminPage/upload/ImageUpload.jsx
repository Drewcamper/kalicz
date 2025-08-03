import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { styles } from './styles';

import { handleUpload } from './utils';
import { useImageContext } from '../../../context/index';

const ImageUpload = ({ onUpload }) => {
  const { images } = useImageContext();

  const [selectedImages, setSelectedImages] = useState([]);
  const [progress, setProgress] = useState({});
  const [maxOrder, setMaxOrder] = useState(0);
  const [uploadCount, setUploadCount] = useState(0); // 🔁 Track completed uploads
  useEffect(() => {
    const loadMaxOrder = async () => {
      const maxOrderNumber = images.length
        ? Math.max(...images.map(img => img.order ?? 0))
        : 0;
      setMaxOrder(maxOrderNumber);
    };
    loadMaxOrder();
  }, [uploadCount]); // 🔁 Re-run when an upload finishes

  const handleDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast('Only image and video files are allowed.');
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedImages(acceptedFiles);
      acceptedFiles.forEach((file, index) => {
        handleUpload({
          file,
          index,
          maxOrder: maxOrder + index,
          onUpload: () => {
            setUploadCount(prev => prev + 1); // ✅ trigger re-fetch
            onUpload?.(); // optional callback from parent
          },
          setProgress,
        });
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
