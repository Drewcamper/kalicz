// utils.js
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { createDocument } from '../../../services';

export const handleUpload = async ({ file, index, maxOrder, onUpload, setProgress }) => {
  if (!file) return;

  const storage = getStorage();

  // === Upload Original Image ===
  const originalRef = ref(storage, `images/${file.name}`);
  const originalUploadTask = uploadBytesResumable(originalRef, file);

  originalUploadTask.on(
    'state_changed',
    snapshot => {
      const progressPercent = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      setProgress(prev => ({ ...prev, [index]: progressPercent }));
    },
    error => {
      toast.error('Original upload error');
    },
    async () => {
      try {
        const originalURL = await getDownloadURL(originalUploadTask.snapshot.ref);

        // === Resize the image ===
        const resizedBlob = await imageReducer(file, { maxWidth: 480, quality: 0.5 });

        // Prefix filename for loader image
        const resizedFileName = `LOADER_IMAGE_${file.name}`;
        const resizedRef = ref(storage, `images/${resizedFileName}`);

        // Upload resized image
        const resizedUploadTask = await uploadBytesResumable(resizedRef, resizedBlob);
        const resizedURL = await getDownloadURL(resizedUploadTask.ref);

        // === Save metadata to Firestore ===
        // Original image doc
        await createDocument({
          url: originalURL,
          name: file.name,
          order: maxOrder + 1 + index,
        });

        // Resized image doc with LOADER_IMAGE_ prefix
        await createDocument({
          url: resizedURL,
          name: resizedFileName,
          originalURL, // optional reference
          order: maxOrder + 1 + index,
        });

        onUpload();
      } catch (error) {
        console.error('Resized image upload error:', error);
        toast.error('Error uploading resized image');
      }
    }
  );
};

const imageReducer = (file, { maxWidth = 800, quality = 0.7 } = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      const image = new Image();

      image.onload = () => {
        try {
          const scale = maxWidth / image.width;
          const canvas = document.createElement('canvas');
          canvas.width = maxWidth;
          canvas.height = image.height * scale;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            blob => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas is empty or toBlob failed'));
              }
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      image.onerror = () => reject(new Error('Failed to load image into <img>'));
      image.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file as DataURL'));
    reader.readAsDataURL(file);
  });
};
