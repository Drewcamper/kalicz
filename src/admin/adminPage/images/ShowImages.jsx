import { useState } from 'react';
import { doc, deleteDoc, writeBatch, getFirestore } from 'firebase/firestore';
import {} from 'firebase/firestore';
import { getStorage, deleteObject, ref } from 'firebase/storage';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { ToastContainer } from 'react-toastify';

import { ImageItem } from './imageItem';
import { chunkImages } from './utils';

import { useAdminContext } from '../../context';
const firestore = getFirestore();
const CHUNK_SIZE = 3;

export const ShowImages = () => {
  const { images, setImages } = useAdminContext();

  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newIndex, setNewIndex] = useState(null);

  setTimeout(() => console.log(images), 1000);

  const handleOnDragEnd = async result => {
    const { source, destination } = result;

    if (!destination) return;

    const imagesMatrix = chunkImages(images, CHUNK_SIZE);

    const sourceRowIndex = parseInt(source.droppableId.split('-')[1]);
    const destinationRowIndex = parseInt(destination.droppableId.split('-')[1]);

    const sourceRow = Array.from(imagesMatrix[sourceRowIndex]);
    const destRow = Array.from(imagesMatrix[destinationRowIndex]);

    const [movedImage] = sourceRow.splice(source.index, 1);

    if (sourceRowIndex === destinationRowIndex) {
      // Move within same row
      sourceRow.splice(destination.index, 0, movedImage);
      imagesMatrix[sourceRowIndex] = sourceRow;
    } else {
      // Move between rows
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
      console.error('Error updating image order:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id, url) => {
    try {
      await deleteDoc(doc(firestore, 'images', id));
      const storage = getStorage();
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
      setImages(prev => prev.filter(image => image.id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
      setError(error.message);
    }
  };

  const handleEditIndex = (id, currentIndex) => {
    setEditingIndex(id);
    setNewIndex(currentIndex);
  };

  const handleUpdateIndex = async id => {
    try {
      const updatedImages = images
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
      console.error('Error updating image order:', error);
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewIndex(null);
  };

  const imagesMatrix = chunkImages(images, CHUNK_SIZE);

  return (
    <div style={styles.container}>
      {error && <p style={styles.error}>{error}</p>}
      <DragDropContext onDragEnd={handleOnDragEnd}>
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

const styles = {
  container: {
    width: '75%',
    height: '100%',
    backgroundColor: 'lightblue',
    overflowY: 'auto',
    padding: '20px',
    paddingBottom: '100px',
    boxSizing: 'border-box',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  gridRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  gridItem: {
    width: '30%',
    height: '300px',
    flexShrink: 0,
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '10px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '150px',
    marginBottom: '10px',
  },
  deleteButton: {
    marginTop: '10px',
    padding: '5px 10px',
    backgroundColor: '#ff5c5c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
  },
};

export default ShowImages;
