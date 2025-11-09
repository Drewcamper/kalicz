import './styles.css';

export const ImageComponent = ({ image, style }) => {
  const handleContextMenu = e => e.preventDefault(); // disables right-click menu
  const handleDragStart = e => e.preventDefault(); // prevents drag-and-drop download

  return (
    <img
      src={image?.url}
      alt={image?.name || ''}
      style={style}
      className='image-component'
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
    />
  );
};
