// import { useImageContext } from '../../context';

// function IndexPage() {
//   const { images } = useImageContext();
//   console.log(images);

//   return (
//     <div style={{ height: '100vh', overflowY: 'scroll' }}>
//       {images.map(image => (
//         <img
//           key={image.id}
//           src={image.url}
//           alt={image.name}
//           style={{ height: '90vh', padding: '8px' }}
//         />
//       ))}
//     </div>
//   );
// }

// export default IndexPage;

import { useImageContext } from '../../context';

function IndexPage() {
  const { images } = useImageContext();
  console.log('Images in IndexPage:', images);

  return (
    <div style={{ height: '100vh', overflowY: 'scroll' }}>
      {images?.map(image => {
        return (
          <img
            key={image.id}
            src={image.url}
            alt={image.name}
            style={{
              height: '90vh',
              padding: '8px',
              transition: 'filter 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}

export default IndexPage;
