import { useImageContext } from '../../context';
import { ImageComponent } from '../image/ImageComponent';

function IndexPage() {
  const { images } = useImageContext();
  const style = {
    // height: '100%',
    // // height: 'calc(100%)',
    // width: 'auto',
    // transition: 'filter 0.3s ease',
    // margin: '0 10vw',
    height: 'calc(100% - 112px - 18px)',
    // height: 'fit-content',
    objectFit: 'contain',
  };
  return (
    <div
      style={{
        // width: 'auto',
        padding: '0 20vw',
        height: '97vh',
        // overflow: 'hidden',
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        // position: 'relative',
        overflowY: 'scroll',
      }}>
      {images?.map(image => {
        return <ImageComponent image={image} style={style} />;
      })}
    </div>
  );
}

export default IndexPage;
