import DisplayImage from './DisplayImage';
import EditImageInfo from './EditImageInfo';

export const ImageItem = ({
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
  return (
    <>
      <DisplayImage image={image} />
      <EditImageInfo
        maxImages={maxImages}
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
    </>
  );
};
