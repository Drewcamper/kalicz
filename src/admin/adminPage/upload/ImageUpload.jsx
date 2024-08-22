import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firestore } from '../../firebase.utils';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

const ImageUpload = ({ onUpload }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [progress, setProgress] = useState({});
  const [maxOrder, setMaxOrder] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMaxOrder = async () => {
      try {
        const q = query(collection(firestore, 'images'), orderBy('order', 'desc'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const lastDoc = querySnapshot.docs[0];
          setMaxOrder(lastDoc.data().order || 0);
        }
      } catch (error) {
        console.error('Error fetching max order:', error);
      }
    };

    fetchMaxOrder();
  }, []);

  const handleDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setErrorMessage('Only image and video files are allowed.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setSelectedImages(acceptedFiles);
      acceptedFiles.forEach((file, index) => handleUpload(file, index));
    }
  };

  const handleUpload = (file, index) => {
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const progressPercent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prevProgress => ({
          ...prevProgress,
          [index]: progressPercent,
        }));
      },
      error => {
        console.error('Upload error:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async downloadURL => {
          const imageRef = collection(firestore, 'images');
          try {
            await addDoc(imageRef, {
              url: downloadURL,
              name: file.name,
              order: maxOrder + 1 + index, // Ensure unique order for each image
            });
            setErrorMessage('');
            if (onUpload) onUpload();
          } catch (error) {
            console.error('Error saving metadata:', error);
          }
        });
      }
    );
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
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
      {selectedImages.length > 0 && (
        <div style={styles.scrollableContainer}>
          {selectedImages.map((file, index) => (
            <div key={index} style={styles.imageContainer}>
              <p>{file.name}</p>
              <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '90%' }} />
              {progress[index] || 0}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '25%',
  },
  dropzone: {
    border: '2px dashed #cccccc',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f7f7f7',
    marginBottom: '10px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
  scrollableContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '10px',
    marginBottom: '100px',
  },
  imageContainer: {
    marginBottom: '50px',
    border: '1px solid black',
  },
};

export default ImageUpload;

ImageUpload.propTypes = {
  onUpload: PropTypes.func,
};
