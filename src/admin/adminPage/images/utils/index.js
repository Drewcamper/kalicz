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
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  )
    return;

  try {
    // Create a copy of the current images
    const updatedImages = [...images];
    // Remove the dragged item
    const [movedImage] = updatedImages.splice(source.index, 1);
    // Insert it at the new position
    updatedImages.splice(destination.index, 0, movedImage);

    // Reassign order numbers sequentially
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    // Optimistically update local state
    setImages(reorderedImages);

    // Prepare batch update for Firestore
    const batch = writeBatch(firestore);

    // Update all images to maintain consistency
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
    console.error('Drag and drop error:', error);
    toast.error('Failed to update order');
    setError(error.message);
    // Revert local state if Firestore update fails
    setImages(images);
  }
};
