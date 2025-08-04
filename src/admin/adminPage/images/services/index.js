import {
  fetchCollection,
  deleteDocument,
  updateDocument,
  getOneOriginalImage,
  fetchCollectionByOrder,
} from '../../../../services';

// Helper function to get original and its loader pair by originalId
export const getLinkedImages = async originalId => {
  const originalImage = await getOneOriginalImage(originalId);
  const { order } = originalImage;

  const loaderImages = await fetchCollectionByOrder(order, true);
  const loaderImage = loaderImages[0] || null;

  return { originalImage, loaderImage };
};

export const fetchImages = async isLoader => {
  const data = await fetchCollection(isLoader);
  return data;
};

export const updateImageTitle = async (originalId, newTitle) => {
  const { originalImage, loaderImage } = await getLinkedImages(originalId);
  console.log({ originalImage, loaderImage });

  await updateDocument(false, originalImage.id, { name: newTitle });

  if (loaderImage) {
    await updateDocument(true, loaderImage.id, { name: newTitle });
  }
};

export const updateImageIndex = async (originalId, newIndex) => {
  const { originalImage, loaderImage } = await getLinkedImages(originalId);

  await updateDocument(false, originalImage.id, { order: newIndex });

  if (loaderImage) {
    await updateDocument(true, loaderImage.id, { order: newIndex });
  }
};

export const deleteImage = async originalId => {
  const { originalImage, loaderImage } = await getLinkedImages(originalId);

  await deleteDocument(false, originalImage.id, originalImage?.url);

  if (loaderImage) {
    await deleteDocument(true, loaderImage.id, loaderImage?.url);
  }
};
