import { fetchCollection, deleteDocument, updateDocument } from '../../../../services';

export const fetchImages = async () => {
  const imagesList = await fetchCollection('images');
  imagesList.sort((a, b) => a.order - b.order);
  return imagesList;
};

export const updateImageTitle = async (id, newTitle) => {
  await updateDocument('images', id, { title: newTitle });
};

export const updateImageIndex = async (id, newIndex) => {
  await updateDocument('images', id, { order: newIndex });
};

export const deleteImage = async id => {
  await deleteDocument('images', id);
};
