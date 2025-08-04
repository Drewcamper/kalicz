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
          console.log('[Resize] Image loaded for resizing:', file.name);

          const scale = maxWidth / image.width;
          const canvas = document.createElement('canvas');
          canvas.width = maxWidth;
          canvas.height = image.height * scale;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            blob => {
              if (blob) {
                console.log('[Resize] Blob created:', blob.size);
                resolve(blob);
              } else {
                console.error('[Resize] Blob creation failed');
                reject(new Error('Canvas is empty or toBlob failed'));
              }
            },
            'image/jpeg',
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

export const handleUpload = async ({
  file,
  index,
  maxOrder,
  onUpload,
  setProgress,
  refetch,
}) => {
  if (!file) return;

  const storage = getStorage();
  const order = maxOrder + index;
  console.log({ order, maxOrder, index });

  const baseName = file?.name.replace(/\.[^/.]+$/, '');
  const extension = file?.name.split('.').pop();

  const originalPath = `images/original/${baseName}.${extension}`;
  const originalRef = ref(storage, originalPath);
  const originalUploadTask = uploadBytesResumable(originalRef, file);

  console.log(`[Upload] Starting original upload for: ${originalPath}`);

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
        console.log('[Upload] Original upload successful:', originalURL);

        const originalImage = {
          url: originalURL,
          name: `${baseName}.${extension}`,
          order,
        };
        console.log('[Upload] Creating Firestore doc for original...');
        await createDocument(false, originalImage);
        console.log('[Upload] Firestore doc created for original image');

        // === Resize and Upload ===
        console.log('[Upload] Resizing image...');
        const resizedBlob = await imageReducer(file, { maxWidth: 480, quality: 0.5 });
        console.log('[Upload] Image resized, size:', resizedBlob.size);

        const resizedPath = `images/loader/${baseName}.${extension}`;
        const resizedRef = ref(storage, resizedPath);
        const resizedUploadTask = await uploadBytesResumable(resizedRef, resizedBlob);
        const resizedURL = await getDownloadURL(resizedUploadTask.ref);
        console.log('[Upload] Resized upload successful:', resizedURL);

        const resizedImage = {
          url: resizedURL,
          name: `${baseName}.${extension}`,
          order,
        };

        console.log('[Upload] Creating Firestore doc for resized...');
        await createDocument(true, resizedImage);
        console.log('[Upload] Firestore doc created for resized image');

        onUpload();
        refetch();
      } catch (error) {
        console.error('[Upload] Error in upload flow:', error);
        toast.error('Error uploading images');
      }
    }
  );
};
