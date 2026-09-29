import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import ImageUpload from './upload/ImageUpload';
import { ShowImages } from './images/ShowImages';
import { migrateLegacyCategory } from './images/services';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { CATEGORIES, DEFAULT_CATEGORY } from '../../constants/categories';

import { styles } from './styles';

function AdminPage({ onLogout }) {
  const [activeCategory, setActiveCategory] = useState(DEFAULT_CATEGORY);
  const [isSyncing, setIsSyncing] = useState(true);

  // One-time, idempotent: images uploaded before categories existed
  // have no `category` field — tag them as "Index" so every admin
  // query (which now always filters by category) still finds them.
  // Safe to run on every login; it's a no-op once nothing is missing
  // the field.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { migrated } = await migrateLegacyCategory();
        if (!cancelled && migrated > 0) {
          toast.info(`${migrated} régi kép Index kategóriába sorolva`);
        }
      } catch (error) {
        console.error('Category migration failed:', error);
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
