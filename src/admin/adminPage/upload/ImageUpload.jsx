import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { styles } from './styles';
import { handleUpload, getMaxOrder } from './utils';
import { useImageContext } from '../../../context/index';

const ImageUpload = ({ onUpload }) => {
  const { originalImages, setOriginalImages } = useImageContext();
  const [selectedImages, setSelectedImages] = useState([]);
  const [progress, setProgress] = useState({});
  const [maxOrder, setMaxOrder] = useState(0);

  useEffect(() => {
    setMaxOrder(getMaxOrder(originalImages));
  }, [originalImages]);

  const handleDrop = async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Only image files are allowed.');
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedImages(acceptedFiles);

      let currentMaxOrder = getMaxOrder(originalImages);

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const order = currentMaxOrder + 1;
        currentMaxOrder = order;

        try {
          await handleUpload({
            file,
            order,
            onUpload: () => {
              onUpload?.();
            },
            setProgress,
            onImageUploaded: newImage => {
              setOriginalImages(prev => {
                const updated = [...prev, newImage];
                return updated.sort((a, b) => a.order - b.order);
              });
            },
          });
        } catch (error) {
          console.error('[ImageUpload] Upload failed for', file.name, error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setSelectedImages([]);
      setProgress({});
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
          {selectedImages.map((file, index) => {
            const order = maxOrder + index + 1;
            return (
              <div key={index} style={styles.imageContainer}>
                <p>{file?.name}</p>
                <img
                  src={URL?.createObjectURL(file)}
                  alt={file?.name}
                  style={{ width: '90%' }}
                />
                {progress[order] || 0}%
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
