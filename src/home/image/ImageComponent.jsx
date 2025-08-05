export const ImageComponent = ({ image, style }) => {
  return (
    <img
      src={image?.url}
      alt={image?.name}
      style={{
        ...style,
      }}
    />
  );
};
