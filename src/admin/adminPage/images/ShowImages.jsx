import { useState } from 'react';
import { doc, writeBatch, getFirestore } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { ToastContainer, toast } from 'react-toastify';

import { ImageItem } from './imageItem';
import { deleteImage } from './services';
import { chunkImages, handleOnDragEnd } from './utils';

import { useImageContext } from '../../../context';

import { styles } from './styles';

const firestore = getFirestore();

export const ShowImages = () => {
  const { images, setImages } = useImageContext();
  console.log({ images });

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
    setEditingIndex(id);
    setNewIndex(currentIndex);
  };

  const handleUpdateIndex = async id => {
    try {
      const updatedImages = images.data
        .map(img => (img.id === id ? { ...img, order: newIndex } : img))
        .sort((a, b) => a.order - b.order);

      const reorderedImages = updatedImages.map((image, index) => ({
        ...image,
        order: index + 1,
      }));

      setImages(reorderedImages);

      const batch = writeBatch(firestore);
      reorderedImages.forEach(image => {
        const imageRef = doc(firestore, 'images', image.id);
        batch.update(imageRef, { order: image.order });
      });

      await batch.commit();
      setEditingIndex(null);
      setNewIndex(null);
    } catch (error) {
      toast('Error updating image order:', error);
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewIndex(null);
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
