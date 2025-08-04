import { useState } from 'react';
import { doc, writeBatch, getFirestore } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { ToastContainer, toast } from 'react-toastify';

import { ImageItem } from './imageItem';
import { deleteImage } from './services';
import { chunkImages, handleOnDragEnd } from './utils';
import { getLinkedImages, updateImageTitle } from './services';

import { useImageContext } from '../../../context';

import { styles } from './styles';

const firestore = getFirestore();

export const ShowImages = () => {
  const { images, setImages } = useImageContext();

  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newIndex, setNewIndex] = useState(null);

  const handleDelete = async id => {
    try {
      await deleteImage(id);
      setImages(prev => prev.filter(image => image.id !== id));
    } catch (error) {
      console.error('Error deleting image pair:', error);
      setError(error.message);
    }
  };

  const handleEditIndex = (id, currentIndex) => {
    console.log({ id, currentIndex });
    setEditingIndex(id);
    setNewIndex(currentIndex);
  };

  const handleUpdateIndex = async id => {
    try {
      // Adjust newIndex if it's higher than the total number of images
      const adjustedNewIndex = Math.min(newIndex, images.length);

      // If the user entered a higher number, update the input field to show the adjusted value
      if (newIndex !== adjustedNewIndex) {
        setNewIndex(adjustedNewIndex);
        toast.info(`Position adjusted to ${adjustedNewIndex}`);
      }

      // Create updated images array with new order
      const updatedImages = [...images];
      const imageToUpdate = updatedImages.find(img => img.id === id);

      if (!imageToUpdate) return;

      // Swap orders
      const oldIndex = imageToUpdate.order;
      const otherImage = updatedImages.find(img => img.order === adjustedNewIndex);

      if (otherImage) {
        otherImage.order = oldIndex;
      }
      imageToUpdate.order = adjustedNewIndex;

      // Sort by new order
      updatedImages.sort((a, b) => a.order - b.order);

      // Reassign orders sequentially to fix any gaps
      const reorderedImages = updatedImages.map((img, index) => ({
        ...img,
        order: index + 1,
      }));

      // Update state
      setImages(reorderedImages);

      // Prepare batch update
      const batch = writeBatch(firestore);

      // First update the moved image and its counterpart
      const { originalImage, loaderImage } = await getLinkedImages(id);

      if (originalImage) {
        const originalRef = doc(firestore, 'original', originalImage.id);
        batch.update(originalRef, { order: imageToUpdate.order });
      }

      if (loaderImage) {
        const loaderRef = doc(firestore, 'loader', loaderImage.id);
        batch.update(loaderRef, { order: imageToUpdate.order });
      }

      // Then update the swapped image (if any) and its counterpart
      if (otherImage) {
        const otherLinked = await getLinkedImages(otherImage.id);

        if (otherLinked.originalImage) {
          const otherOriginalRef = doc(
            firestore,
            'original',
            otherLinked.originalImage.id
          );
          batch.update(otherOriginalRef, { order: otherImage.order });
        }

        if (otherLinked.loaderImage) {
          const otherLoaderRef = doc(firestore, 'loader', otherLinked.loaderImage.id);
          batch.update(otherLoaderRef, { order: otherImage.order });
        }
      }

      await batch.commit();
      setEditingIndex(null);
      setNewIndex(null);
      toast.success('Order updated successfully');
    } catch (error) {
      toast.error(`Error updating order: ${error.message}`);
      console.error('Error updating order:', error);
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
        prev.map(img => (img.id === id ? { ...img, name: newName } : img))
      );
      toast.success('Name updated successfully');
    } catch (error) {
      toast.error(`Error updating name: ${error.message}`);
      console.error('Error updating name:', error);
    }
  };

  const imagesMatrix = chunkImages(images);

  return (
    <div style={styles.container}>
      {error && <p style={styles.error}>{error}</p>}
      <DragDropContext
        onDragEnd={result =>
          handleOnDragEnd({
            result,
            images,
            setImages,
            firestore,
            setError,
          })
        }>
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
                          handleCancelIndex={handleCancelEdit}
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
      <ToastContainer />
    </div>
  );
};

export default ShowImages;
