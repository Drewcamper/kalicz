import { doc, writeBatch } from 'firebase/firestore';
import { toast } from 'react-toastify';

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

  const imagesMatrix = chunkImages(images);

  const sourceRowIndex = parseInt(source.droppableId.split('-')[1]);
  const destinationRowIndex = parseInt(destination.droppableId.split('-')[1]);

  const sourceRow = Array.from(imagesMatrix[sourceRowIndex]);
  const destRow = Array.from(imagesMatrix[destinationRowIndex]);

  const [movedImage] = sourceRow.splice(source.index, 1);

  if (sourceRowIndex === destinationRowIndex) {
    sourceRow.splice(destination.index, 0, movedImage);
    imagesMatrix[sourceRowIndex] = sourceRow;
  } else {
    destRow.splice(destination.index, 0, movedImage);
    imagesMatrix[sourceRowIndex] = sourceRow;
    imagesMatrix[destinationRowIndex] = destRow;
  }

  const newImageList = imagesMatrix.flat().map((img, idx) => ({
    ...img,
    order: idx + 1,
  }));

  setImages(newImageList);

  try {
    const batch = writeBatch(firestore);
    newImageList.forEach(image => {
      const imageRef = doc(firestore, 'images', image.id);
      batch.update(imageRef, { order: image.order });
    });
    await batch.commit();
  } catch (error) {
    toast.error(`Error updating image order: ${error.message}`);
    setError(error.message);
  }
};
