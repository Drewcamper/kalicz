import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const firestore = getFirestore();

export const ShowImages = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newIndex, setNewIndex] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'images'));
        const imagesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        imagesList.sort((a, b) => a.order - b.order);
        setImages(imagesList);
      } catch (error) {
        console.error('Error fetching images:', error);
        setError(error.message);
      }
    };

    fetchImages();
  }, []);

  const handleDelete = async (id, url) => {
    try {
      await deleteDoc(doc(firestore, 'images', id));

      const storage = getStorage();
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);

      setImages(prevImages => prevImages.filter(image => image.id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
      setError(error.message);
    }
  };

  const handleOnDragEnd = async result => {
    const { source, destination } = result;

    if (!destination) return;

    const reorderedImages = Array.from(images);
    const [movedImage] = reorderedImages.splice(source.index, 1);
    reorderedImages.splice(destination.index, 0, movedImage);

    const updatedImages = reorderedImages.map((image, index) => ({ ...image, order: index + 1 }));

    setImages(updatedImages);

    try {
      const batch = writeBatch(firestore);
      updatedImages.forEach(image => {
        const imageRef = doc(firestore, 'images', image.id);
        batch.update(imageRef, { order: image.order });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error updating image order:', error);
      setError(error.message);
    }
  };

  const handleEditIndex = (id, currentIndex) => {
    setEditingIndex(id);
    setNewIndex(currentIndex);
  };

  const handleUpdateIndex = async id => {
    try {
      const updatedImages = images.map(img => (img.id === id ? { ...img, order: newIndex } : img)).sort((a, b) => a.order - b.order);

      const reorderedImages = updatedImages.map((image, index) => ({ ...image, order: index + 1 }));

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

  return (
    <div style={styles.container}>
      <h2>Uploaded Images</h2>
      {error && <p style={styles.error}>{error}</p>}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId='droppable'>
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={styles.grid}>
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ ...styles.gridItem, ...provided.draggableProps.style }}>
                      <img src={image.url} alt={image.name} style={styles.image} onError={e => (e.target.src = 'https://via.placeholder.com/150')} />
                      {image.name}
                      {editingIndex === image.id ? (
                        <div>
                          <input type='number' value={newIndex} onChange={e => setNewIndex(Number(e.target.value))} min={1} max={images.length} />
                          <button onClick={() => handleUpdateIndex(image.id)}>Save</button>
                          <button onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      ) : (
                        <div>
                          <span>Order: {index + 1}</span>
                          <button onClick={() => handleEditIndex(image.id, index + 1)}>Edit</button>
                          <button style={styles.deleteButton} onClick={() => handleDelete(image.id, image.url)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
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
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    height: '300px',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '150px',
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
