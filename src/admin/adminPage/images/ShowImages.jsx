import { useState } from 'react';
import { doc, writeBatch, getFirestore } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { ImageItem } from './imageItem';
import {
  deleteImage,
  getLinkedImages,
  updateImageTitle,
  cleanupOrphanedLoaders,
} from './services';
import { chunkImages, handleOnDragEnd } from './utils';
import { useImageContext } from '../../../context';
import { DEFAULT_CATEGORY } from '../../../constants/categories';
import { styles } from './styles';

const firestore = getFirestore();

export const ShowImages = ({ category = DEFAULT_CATEGORY }) => {
  const {
    originalImagesByCategory,
    setOriginalImagesForCategory,
    refreshLoaderImages,
    refreshOriginalImages,
  } = useImageContext();
  const images = originalImagesByCategory[category] || [];
  const setImages = updater => setOriginalImagesForCategory(category, updater);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newIndex, setNewIndex] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const handleDelete = async id => {
    try {
      // First delete the image from Firestore and storage
      await deleteImage(id);
    } catch (error) {
      // deleteImage can fail partway through (e.g. the original's
      // Storage file is removed but the linked loader's delete then
      // throws), which used to leave an orphaned loader document that
      // silently kept reappearing on the live site forever, with no
      // way to notice from the admin UI. Sweep it up immediately
      // instead of letting it rot, then surface the original error.
      try {
        await cleanupOrphanedLoaders();
      } catch (cleanupError) {
        console.error('Error cleaning up orphaned loaders after failed delete:', cleanupError);
      }
      await refreshLoaderImages();
      await refreshOriginalImages();
      setError(error.message);
      return;
    }

    try {
      // Get the order of the deleted image before removing it
      const deletedImage = images.find(img => img.id === id);
      const deletedOrder = deletedImage?.order || 0;

      // Remove the image from local state
      const filteredImages = images.filter(image => image.id !== id);

      // Reassign orders sequentially to fill the gap
      const reorderedImages = filteredImages
        .map(img => {
          // Only update orders higher than the deleted image's order
          return {
            ...img,
            order: img.order > deletedOrder ? img.order - 1 : img.order,
          };
        })
        .sort((a, b) => a.order - b.order); // Ensure proper sorting

      // Update local state
      setImages(reorderedImages);

      // Prepare batch update for Firestore
      const batch = writeBatch(firestore);

      // Update all affected images in Firestore
      for (const img of reorderedImages) {
        // Only update images that were after the deleted one
        if (img.order >= deletedOrder) {
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
      }

      await batch.commit();
      // Purge any orphaned loader (e.g. left over from an earlier
      // partial delete) and re-verify both collections against
      // Firestore rather than trusting the locally-recomputed orders.
      await cleanupOrphanedLoaders();
      await refreshLoaderImages();
      await refreshOriginalImages();
    } catch (error) {
      setError(error.message);
      // Local state may now disagree with Firestore (the batch reorder
      // can fail partway through) — re-sync from the source of truth
      // rather than leaving the admin list stuck on a bad guess.
      await refreshLoaderImages();
      await refreshOriginalImages();
    }
  };

  const handleEditIndex = (id, currentIndex) => {
    setEditingIndex(id);
    setNewIndex(currentIndex);
  };

  const handleUpdateIndex = async id => {
    try {
      setIsReordering(true);
      const adjustedNewIndex = Math.min(newIndex, images.length);

      if (newIndex !== adjustedNewIndex) {
        setNewIndex(adjustedNewIndex);
        toast.info(`Position adjusted to ${adjustedNewIndex}`);
      }

      const updatedImages = [...images];
      const imageToUpdate = updatedImages.find(img => img.id === id);
      if (!imageToUpdate) return;

      const oldIndex = imageToUpdate.order;
      const otherImage = updatedImages.find(img => img.order === adjustedNewIndex);

      if (otherImage) {
        otherImage.order = oldIndex;
      }
      imageToUpdate.order = adjustedNewIndex;

      updatedImages.sort((a, b) => a.order - b.order);
      const reorderedImages = updatedImages.map((img, index) => ({
        ...img,
        order: index + 1,
      }));

      setImages(reorderedImages);

      const batch = writeBatch(firestore);
      const { originalImage, loaderImage } = await getLinkedImages(id);

      if (originalImage) {
        batch.update(doc(firestore, 'original', originalImage.id), {
          order: imageToUpdate.order,
        });
      }

      if (loaderImage) {
        batch.update(doc(firestore, 'loader', loaderImage.id), {
          order: imageToUpdate.order,
        });
      }

      if (otherImage) {
        const otherLinked = await getLinkedImages(otherImage.id);
        if (otherLinked.originalImage) {
          batch.update(doc(firestore, 'original', otherLinked.originalImage.id), {
            order: otherImage.order,
          });
        }
        if (otherLinked.loaderImage) {
          batch.update(doc(firestore, 'loader', otherLinked.loaderImage.id), {
            order: otherImage.order,
          });
        }
      }

      await batch.commit();
      await refreshLoaderImages();
      await refreshOriginalImages();
      setEditingIndex(null);
      setNewIndex(null);
      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Order update error:', error);
      toast.error(`Failed to update order: ${error.message}`);
      // The batch can fail partway through, leaving Firestore's orders
      // out of sync with what we just guessed locally — re-fetch rather
      // than reverting to the (possibly now also stale) pre-edit state.
      await refreshLoaderImages();
      await refreshOriginalImages();
    } finally {
      setIsReordering(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewIndex(null);
  };

  const handleUpdateName = async (id, newName) => {
    try {
      await updateImageTitle(id, newName);
      setImages(prev =>
        prev.map(img => (img.id === id ? { ...img, name: newName } : img)),
      );
      toast.success('Name updated successfully');
    } catch (error) {
      console.error('Name update error:', error);
      toast.error(`Failed to update name: ${error.message}`);
    }
  };

  const imagesMatrix = chunkImages(images);

  return (
    <div style={styles.container}>
      {error && <p style={styles.error}>{error}</p>}
      {isReordering && <div style={styles.loadingOverlay}>Updating order...</div>}

      <DragDropContext
        onDragEnd={async result => {
          try {
            setIsReordering(true);
            await handleOnDragEnd({
              result,
              images,
              setImages,
              firestore,
              setError,
              refreshLoaderImages,
              refreshOriginalImages,
            });
          } catch (error) {
            console.error('Drag error:', error);
            toast.error('Failed to reorder images');
          } finally {
            setIsReordering(false);
          }
        }}>
        {imagesMatrix.map((row, rowIndex) => (
          <Droppable
            key={`row-${rowIndex}`}
            droppableId={`row-${rowIndex}`}
            direction='horizontal'>
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={styles.gridRow}>
                {row.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...styles.gridItem,
                          ...provided.draggableProps.style,
                        }}>
                        <ImageItem
                          maxImages={images.length}
                          image={image}
                          editingIndex={editingIndex}
                          setNewIndex={setNewIndex}
                          newIndex={newIndex}
                          handleUpdateIndex={handleUpdateIndex}
                          handleCancelEdit={handleCancelEdit}
                          handleEditIndex={handleEditIndex}
                          handleDelete={handleDelete}
                          handleUpdateName={handleUpdateName}
                      />
                    </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
      <ToastContainer position='bottom-right' autoClose={3000} />
    </div>
  );
};

ShowImages.propTypes = {
  category: PropTypes.string,
};

export default ShowImages;
