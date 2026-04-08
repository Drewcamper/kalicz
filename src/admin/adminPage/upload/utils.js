import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { createDocument } from '../../../services';

const imageReducer = (file, { maxDimension = 800, quality = 0.7 } = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      const image = new Image();
      image.onload = () => {
        try {
          const longestSide = Math.max(image.width, image.height);
          const scale = Math.min(maxDimension / longestSide, 1);
          const canvas = document.createElement('canvas');
          canvas.width = image.width * scale;
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
            'image/avif',
            quality,
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
  order,
  onUpload,
  setProgress,
  onImageUploaded,
}) => {
  if (!file) return;

  const storage = getStorage();

  toast.info(`Uploading ${file.name}...`);

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const extension = file.name.split('.').pop();

  // === Upload original ===
  const originalPath = `images/original/${baseName}.${extension}`;
  const originalRef = ref(storage, originalPath);
  const originalUploadTask = uploadBytesResumable(originalRef, file);

  // Track progress
  originalUploadTask.on('state_changed', snapshot => {
    const progressPercent = Math.round(
      (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
    );
    setProgress(prev => ({ ...prev, [order]: progressPercent }));
  });

  // Await upload completion (UploadTask is thenable)
  await originalUploadTask;

  const originalURL = await getDownloadURL(originalUploadTask.snapshot.ref);

  // Get original image dimensions
  const img = new Image();
  img.src = originalURL;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
  const originalHeight = img.height;
  const originalWidth = img.width;

  const originalImage = {
    url: originalURL,
    name: `${baseName}.${extension}`,
    order,
    originalHeight,
    originalWidth,
  };
  const documentId = await createDocument(false, originalImage);

  // === Resize and upload loader ===
  const resizedBlob = await imageReducer(file, { maxDimension: 320, quality: 0.4 });

  const resizedPath = `images/loader/${baseName}.avif`;
  const resizedRef = ref(storage, resizedPath);
  const resizedUploadTask = uploadBytesResumable(resizedRef, resizedBlob, {
    contentType: 'image/avif',
    cacheControl: 'public, max-age=31536000',
  });
  await resizedUploadTask;
  const resizedURL = await getDownloadURL(resizedUploadTask.snapshot.ref);

  const resizedImage = {
    url: resizedURL,
    name: `${baseName}.${extension}`,
    order,
    originalHeight,
    originalWidth,
  };
  await createDocument(true, resizedImage);

  // Notify parent — this now fires in sequence because handleUpload is awaited
  const uploadedImage = { ...originalImage, id: documentId };
  onImageUploaded?.(uploadedImage);
  onUpload?.();
};
