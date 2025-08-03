import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { createDocument } from '../../../services';

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

export const handleUpload = async ({ file, index, maxOrder, onUpload, setProgress }) => {
  if (!file) return;

  const storage = getStorage();
  const order = maxOrder + 1 + index;

  const baseName = file.name.replace(/\.[^/.]+$/, ''); // remove extension
  const extension = file.name.split('.').pop(); // get extension

  // === Upload Original Image ===
  const originalPath = `images/original/${baseName}.${extension}`;
  const originalRef = ref(storage, originalPath);
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

        const originalImage = {
          url: originalURL,
          name: `${baseName}.${extension}`,
          order,
        };
        await createDocument(false, originalImage);

        // === Resize and Upload the Image ===
        const resizedBlob = await imageReducer(file, { maxWidth: 480, quality: 0.5 });
        const resizedPath = `images/loader/${baseName}.${extension}`;
        const resizedRef = ref(storage, resizedPath);
        const resizedUploadTask = await uploadBytesResumable(resizedRef, resizedBlob);
        const resizedURL = await getDownloadURL(resizedUploadTask.ref);

        const resizedImage = {
          url: resizedURL,
          name: `${baseName}.${extension}`, // optional: prefix if needed
          order,
        };
        await createDocument(true, resizedImage);

        onUpload();
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Error uploading images');
      }
    }
  );
};
