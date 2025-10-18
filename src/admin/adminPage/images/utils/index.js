import { doc, writeBatch } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { getLinkedImages } from '../services';

export const CHUNK_SIZE = 3;

export const chunkImages = arr => {
  const result = [];
  for (let i = 0; i < arr?.length; i += CHUNK_SIZE) {
    result.push(arr.slice(i, i + CHUNK_SIZE));
  }
  return result;
};

export const handleOnDragEnd = async params => {
  const { result, images, setImages, firestore, setError } = params;
  const { source, destination } = result;

  if (!destination) return;

  // Flatten position indexes into one linear sequence
  const startRow = parseInt(source.droppableId.replace('row-', ''), 10);
  const endRow = parseInt(destination.droppableId.replace('row-', ''), 10);

  // Calculate absolute source/destination indexes in the flat array
  const sourceIndex = startRow * CHUNK_SIZE + source.index;
  const destinationIndex = endRow * CHUNK_SIZE + destination.index;

  if (sourceIndex === destinationIndex) return;

  try {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(sourceIndex, 1);
    updatedImages.splice(destinationIndex, 0, movedImage);

    // Recalculate and normalize order
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    setImages(reorderedImages);

    // Batch update to Firestore
    const batch = writeBatch(firestore);

    for (const img of reorderedImages) {
      const { originalImage, loaderImage } = await getLinkedImages(img.id);

      if (originalImage) {
        const originalRef = doc(firestore, 'original', originalImage.id);
        batch.update(originalRef, { order: img.order });
      }

      if (loaderImage) {
        const loaderRef = doc(firestore, 'loader', loaderImage.id);
        batch.update(loaderRef, { order: img.order });
      }
    }

    await batch.commit();
    toast.success('Order updated successfully');
  } catch (error) {
    console.error('Matrix drag error:', error);
    toast.error('Failed to update order');
    setError(error.message);
    setImages(images);
  }
};
