// import React, { useState, useEffect } from 'react';
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { firestore } from '../../firebase.utils'; // Ensure you have this import
// import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
// import { useDropzone } from 'react-dropzone';

// const ImageUpload = ({ onUpload }) => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [maxOrder, setMaxOrder] = useState(0);

//   useEffect(() => {
//     const fetchMaxOrder = async () => {
//       try {
//         const q = query(collection(firestore, 'images'), orderBy('order', 'desc'));
//         const querySnapshot = await getDocs(q);
//         if (!querySnapshot.empty) {
//           const lastDoc = querySnapshot.docs[0];
//           setMaxOrder(lastDoc.data().order || 0);
//         }
//       } catch (error) {
//         console.error('Error fetching max order:', error);
//       }
//     };

//     fetchMaxOrder();
//   }, []);

//   const handleDrop = acceptedFiles => {
//     const file = acceptedFiles[0];
//     if (file) {
//       setSelectedImage(file);
//       handleUpload(file);
//     }
//   };

//   const handleUpload = file => {
//     if (!file) return;

//     const storage = getStorage();
//     const storageRef = ref(storage, `images/${file.name}`);
//     const uploadTask = uploadBytesResumable(storageRef, file);

//     uploadTask.on(
//       'state_changed',
//       snapshot => {
//         const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
//         setProgress(progress);
//       },
//       error => {
//         console.error('Upload error:', error);
//       },
//       () => {
//         getDownloadURL(uploadTask.snapshot.ref).then(async downloadURL => {
//           // Save metadata to Firestore
//           const imageRef = collection(firestore, 'images');
//           try {
//             await addDoc(imageRef, {
//               url: downloadURL,
//               name: file.name,
//               order: maxOrder + 1, // Set the new order to the next number
//             });
//             setSelectedImage(null);
//             setProgress(0);
//             setMaxOrder(maxOrder + 1); // Update maxOrder state
//             if (onUpload) onUpload(); // Notify parent component
//           } catch (error) {
//             console.error('Error saving metadata:', error);
//           }
//         });
//       }
//     );
//   };

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop: handleDrop,
//     accept: {
//       'image/*': [],
//       'video/*': [],
//     },
//   });

//   return (
//     <div style={{ width: '25%' }}>
//       <div {...getRootProps()} style={styles.dropzone}>
//         <input {...getInputProps()} />
//         <p>Drag 'n' drop an image or video here, or click to select one</p>
//       </div>
//       {progress > 0 && <p>Upload Progress: {progress}%</p>}
//       {selectedImage && <img src={URL.createObjectURL(selectedImage)} alt={selectedImage.name} style={{ width: '90%' }} />}
//     </div>
//   );
// };

// const styles = {
//   dropzone: {
//     border: '2px dashed #cccccc',
//     borderRadius: '8px',
//     padding: '20px',
//     textAlign: 'center',
//     cursor: 'pointer',
//     backgroundColor: '#f7f7f7',
//     marginBottom: '10px',
//   },
// };

// export default ImageUpload;


import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firestore } from '../../firebase.utils'; // Ensure you have this import
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ onUpload }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [progress, setProgress] = useState(0);
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
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      handleUpload(file);
    }
  };

  const handleUpload = file => {
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      },
      error => {
        console.error('Upload error:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async downloadURL => {
          // Save metadata to Firestore
          const imageRef = collection(firestore, 'images');
          try {
            await addDoc(imageRef, {
              url: downloadURL,
              name: file.name,
              order: maxOrder + 1, // Set the new order to the next number
            });
            setSelectedImage(null);
            setProgress(0);
            setMaxOrder(maxOrder + 1); // Update maxOrder state
            setErrorMessage(''); // Clear error message on successful upload
            if (onUpload) onUpload(); // Notify parent component
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
      // 'video/*': [],
    },
    multiple: false, // Allow only one file at a time
  });

  return (
    <div style={{ width: '25%' }}>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop an image or video here, or click to select one</p>
      </div>
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
      {progress > 0 && <p>Upload Progress: {progress}%</p>}
      {selectedImage && <img src={URL.createObjectURL(selectedImage)} alt={selectedImage.name} style={{ width: '90%' }} />}
    </div>
  );
};

const styles = {
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
};

export default ImageUpload;