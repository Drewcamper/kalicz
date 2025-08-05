import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';

function IndexPage() {
  const { images } = useImageContext();
  const style = {
    // height: '100%',
    height: 'calc(100% - 112px - 18px)',
    width: 'auto',
    // padding: '8px',
    transition: 'filter 0.3s ease',
    // margin: '5vh 20% 5vh 20%',
    margin: '0 10vw',
  };
  return (
    <div style={{ height: '97vh', overflowY: 'scroll' }}>
      {images?.map(image => {
        return <ImageComponent image={image} style={style} />;
      })}
    </div>
  );
}

export default IndexPage;
