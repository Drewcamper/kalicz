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
                console.error('[Resize] Blob creation failed');
                reject(new Error('Canvas is empty or toBlob failed'));
              }
            },
            'image',
            quality
          );
        } catch (err) {
          console.error('[Resize] Error drawing image:', err);
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

export const getMaxOrder = images => {
  if (!images || images.length === 0) return 0;
  return Math.max(...images.map(img => img.order));
};

export const handleUpload = async ({
  file,
  index,
  // maxOrder,
  images,
  onUpload,
  setProgress,
  refetch,
}) => {
  if (!file) return;

  const storage = getStorage();
  const maxOrder = getMaxOrder(images);
  const order = maxOrder + index + 1;

  const baseName = file?.name.replace(/\.[^/.]+$/, '');
  const extension = file?.name.split('.').pop();

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
      console.error('[Upload] Original upload failed:', error);
      toast.error('Original upload error');
    },
    async () => {
      try {
        const originalURL = await getDownloadURL(originalUploadTask.snapshot.ref);

        //et Original Image Dimensions
        const img = new Image();
        img.src = originalURL;
        await new Promise(resolve => (img.onload = resolve));
        const originalHeight = img.height;
        const originalWidth = img.width;

        const originalImage = {
          url: originalURL,
          name: `${baseName}.${extension}`,
          order,
          originalHeight,
          originalWidth,
        };
        await createDocument(false, originalImage);

        // === Resize and Upload ===

        const resizedBlob = await imageReducer(file, { maxWidth: 480, quality: 0.5 });

        const resizedPath = `images/loader/${baseName}.${extension}`;
        const resizedRef = ref(storage, resizedPath);
        const resizedUploadTask = await uploadBytesResumable(resizedRef, resizedBlob);
        const resizedURL = await getDownloadURL(resizedUploadTask.ref);

        const resizedImage = {
          url: resizedURL,
          name: `${baseName}.${extension}`,
          order,
          originalHeight,
          originalWidth,
        };

        await createDocument(true, resizedImage);

        onUpload();
        refetch();
      } catch (error) {
        console.error('[Upload] Error in upload flow:', error);
        toast.error('Error uploading images');
      }
    }
  );
};
