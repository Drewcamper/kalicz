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

  try {
    // Delete both original and loader in the same operation
    await deleteDocument(false, originalImage.id, originalImage?.url);

    if (loaderImage) {
      await deleteDocument(true, loaderImage.id, loaderImage?.url);
    } else {
      // If loader not found by order, log a warning to detect orphaned documents
      console.warn(
        `No loader image found for originalId: ${originalId} with order: ${originalImage.order}`,
      );
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Helper function to identify and cleanup orphaned loader documents
export const cleanupOrphanedLoaders = async () => {
  try {
    const originals = await fetchCollection(false);
    const loaders = await fetchCollection(true);

    const orphanedLoaders = loaders.filter(loader => {
      // A loader is orphaned if no original has the same order
      return !originals.some(original => original.order === loader.order);
    });

    if (orphanedLoaders.length === 0) {
      console.log('No orphaned loader documents found');
      return { cleaned: 0, orphaned: [] };
    }

    console.warn(
      `Found ${orphanedLoaders.length} orphaned loader documents:`,
      orphanedLoaders,
    );

    // Delete orphaned loaders
    for (const orphan of orphanedLoaders) {
      await deleteDocument(true, orphan.id, orphan?.url);
    }

    return { cleaned: orphanedLoaders.length, orphaned: orphanedLoaders };
  } catch (error) {
    console.error('Error cleaning up orphaned loaders:', error);
    throw error;
  }
};
