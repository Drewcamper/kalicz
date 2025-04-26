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
}) => {
  return (
    <div>
      <input value={image.name}></input>
      {editingIndex === image.id ? (
        <div>
          <input
            type='number'
            value={newIndex}
            onChange={e => setNewIndex(Number(e.target.value))}
            min={1}
            max={maxImages}
          />
          <button onClick={() => handleUpdateIndex(image.id)}>Save</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </div>
      ) : (
        <div>
          <span>Order: {image.order}</span>
          <button onClick={() => handleEditIndex(image.id, image.order)}>Edit</button>
          <button
            style={styles.deleteButton}
            onClick={() => handleDelete(image.id, image.url)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  deleteButton: {
    marginTop: '10px',
    padding: '5px 10px',
    backgroundColor: '#ff5c5c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default EditImageInfo;
