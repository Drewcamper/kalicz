import { useState, useEffect } from 'react';
import { styles } from './styles';

export const EditImageInfo = ({
  maxImages,
  image,
  editingIndex,
  setNewIndex,
  newIndex,
  handleUpdateIndex,
  handleCancelEdit,
  handleEditIndex,
  handleDelete,
  handleUpdateName,
}) => {
  const [editedName, setEditedName] = useState(image?.name || '');

  // Update local state when image changes
  useEffect(() => {
    setEditedName(image?.name || '');
  }, [image]);

  const handleNameChange = e => {
    setEditedName(e.target.value);
  };

  const handleSave = () => {
    // Update both name and order if needed
    if (editedName !== image.name) {
      handleUpdateName(image.id, editedName);
    }
    if (editingIndex === image.id && newIndex !== image.order) {
      handleUpdateIndex(image.id);
    }
  };

  return (
    <div style={styles.editContainer}>
      {editingIndex === image?.id ? (
        <>
          <input
            value={editedName}
            onChange={handleNameChange}
            style={styles.nameInput}
          />
          <div style={styles.orderEditContainer}>
            <span>Order: </span>
            <input
              type='number'
              value={newIndex}
              onChange={e => setNewIndex(Number(e.target.value))}
              min={1}
              max={maxImages}
              style={styles.orderInput}
            />
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={handleSave} style={styles.saveButton}>
              Save
            </button>
            <button
              onClick={() => {
                handleCancelEdit();
              }}
              style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <span style={styles.nameText}>{image?.name}</span>
          <div style={styles.orderText}>Order: {image?.order}</div>
          <div style={styles.buttonGroup}>
            <button
              onClick={() => handleEditIndex(image?.id, image?.order)}
              style={styles.editButton}>
              Edit
            </button>
            <button style={styles.deleteButton} onClick={() => handleDelete(image?.id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditImageInfo;
