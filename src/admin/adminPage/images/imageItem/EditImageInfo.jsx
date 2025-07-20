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

export default EditImageInfo;
