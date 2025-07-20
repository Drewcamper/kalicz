import { fetchCollection, deleteDocument, updateDocument } from '../../../../services';

const fetchOriginalImages = async () => {
  const imagesList = await fetchCollection();
  const filteredImages = imagesList.filter(
    image => !image.name.startsWith('LOADER_IMAGE')
  );
  filteredImages.sort((a, b) => a.order - b.order);

  return filteredImages;
};

const fetchLoaderImages = async () => {
  const imagesList = await fetchCollection();
  const filteredImages = imagesList.filter(image =>
    image.name.startsWith('LOADER_IMAGE')
  );
  filteredImages.sort((a, b) => a.order - b.order);

  return filteredImages;
};

export const fetchImages = async (originalImages = true) => {
  return originalImages ? fetchOriginalImages() : fetchLoaderImages();
};

const findMatchingDocs = async id => {
  const allImages = await fetchCollection();
  console.log({ id, allImages });

  const matched = allImages.filter(img => img.id === id);

  const originalDoc = matched.find(img => !img.name.startsWith('LOADER_IMAGE'));
  const loaderDoc = matched.find(img => img.name.startsWith('LOADER_IMAGE'));

  console.log('Found originalDoc:', originalDoc);
  console.log('Found loaderDoc:', loaderDoc);

  return {
    original: originalDoc ? { id: originalDoc.id, url: originalDoc.url } : null,
    loader: loaderDoc ? { id: loaderDoc.id, url: loaderDoc.url } : null,
  };
};

export const updateImageTitle = async (id, newTitle) => {
  const { originalId, loaderId } = await findMatchingDocs(id);

  if (originalId) await updateDocument(originalId, { title: newTitle });
  if (loaderId) await updateDocument(loaderId, { title: newTitle });
};

export const updateImageIndex = async (id, newIndex) => {
  const { originalId, loaderId } = await findMatchingDocs(id);

  if (originalId) await updateDocument(originalId, { order: newIndex });
  if (loaderId) await updateDocument(loaderId, { order: newIndex });
};

export const deleteImage = async id => {
  console.log(`Deleting images for id: ${id}`);
  const { original, loader } = await findMatchingDocs(id);

  if (original) await deleteDocument(original.id, original.url);
  if (loader) await deleteDocument(loader.id, loader.url);
};
