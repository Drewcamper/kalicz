import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import ImageUpload from './upload/ImageUpload';
import { ShowImages } from './images/ShowImages';
import { migrateLegacyCategory, cleanupOrphanedLoaders } from './images/services';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { CATEGORIES, DEFAULT_CATEGORY } from '../../constants/categories';
import { useImageContext } from '../../context';

import { styles } from './styles';

function AdminPage({ onLogout }) {
  const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY);
  const [isSyncing, setIsSyncing] = useState(true);
  const { refreshLoaderImages } = useImageContext();

  // One-time, idempotent maintenance run on every admin login:
  // - images uploaded before categories existed have no `category`
  //   field — tag them as "Index" so every admin query (which now
  //   always filters by category) still finds them.
  // - a loader (thumbnail) document whose matching original was
  //   deleted, but whose own delete failed partway through (e.g. its
  //   Storage file was already gone), is an orphan: nothing in admin
  //   references it any more, yet the public site still renders it
  //   straight off the loader collection, so a "deleted" photo can
  //   keep reappearing on matekalicz.com indefinitely. Sweeping these
  //   on every admin session is a safe no-op once nothing is orphaned.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { migrated } = await migrateLegacyCategory();
        if (!cancelled && migrated > 0) {
          toast.info(`${migrated} régi kép Index kategóriába sorolva`);
        }

        const { cleaned } = await cleanupOrphanedLoaders();
        if (!cancelled && cleaned > 0) {
          toast.info(`${cleaned} elárvult (törölt, de meg nem jelenített) kép eltávolítva`);
          await refreshLoaderImages();
        }
      } catch (error) {
        console.error('Admin maintenance sync failed:', error);
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      toast('Error logging out:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.buttons}>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.categoryTabs}>
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            style={{
              ...styles.categoryTab,
              ...(activeCategory === key ? styles.categoryTabActive : {}),
            }}>
            {label}
          </button>
        ))}
      </div>

      {isSyncing ? (
        <div style={styles.syncing}>Syncing…</div>
      ) : (
        <div style={styles.content}>
          <ImageUpload category={activeCategory} />
          <ShowImages category={activeCategory} />
        </div>
      )}
    </div>
  );
}

export default AdminPage;

AdminPage.propTypes = {
  onLogout: PropTypes.func,
};
