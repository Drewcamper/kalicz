import './responsive.css';
import { styles } from './styles';
import infoStar from '../../assets/info-star.png';

function Contacts({ handleContactClick }) {
  return (
    // Fixed, transparent, full-viewport: catches a click anywhere
    // OUTSIDE the star to close it, but has no visual backdrop and no
    // scroll handling of its own, so the page underneath stays fully
    // visible and the visitor can keep scrolling/clicking it exactly
    // as if this weren't here.
    <div className='info-scrim' style={styles.scrim} onClick={handleContactClick}>
      <div
        className='info-star-wrap'
        style={styles.starWrap}
        onClick={e => e.stopPropagation()}>
        <img src={infoStar} alt='' className='info-star-img' style={styles.starImg} />

        <div className='info-star-text' style={styles.starText}>
          {/* Each sentence pinned to its own line (not relying on the
              container's width to wrap it there), with a small explicit
              gap between them — same flex-column pattern as .refers
              below. */}
          <div style={styles.introduction} className='introduction'>
            <span>Máté Kalicz is a photographer based in Budapest, Hungary.</span>
            <span>He combines applied work with a personal approach.</span>
          </div>

          <div style={styles.refers} className='refers'>
            <a href='mailto:matekalicz@gmail.com'>matekalicz@gmail.com</a>
            <a href='tel:+36309563017'>+36309563017</a>
            <a
              href='https://www.instagram.com/matekalicz'
              target='_blank'
              rel='noopener noreferrer'>
              @matekalicz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
