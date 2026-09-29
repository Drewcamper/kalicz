import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';

import { Admin } from './admin/Admin';
import IndexPage from './home/index/IndexPage';
import { Menu } from './home/menu';
import Contacts from './home/contacts';
import { Slideshow } from './home/slideshow';
import CategoryPage from './home/category/CategoryPage';

import { ImageProvider, useImageContext } from './context';

const AppContent = () => {
  const [showContact, setShowContact] = useState(false);
  const { phoneView } = useImageContext();

  const handleContactClick = () => {
    setShowContact(prev => !prev);
  };

  return (
    <>
      <Menu onContactClick={handleContactClick} />

      <Routes>
        {/* Base route */}
        <Route path='/' element={phoneView ? <IndexPage /> : <Slideshow />} />

        {/* Index route: desktop only */}
        <Route
          path='/index'
          element={phoneView ? <Navigate to='/' replace /> : <IndexPage />}
        />

        {/* Category routes: Event / Table / On Set. Each CategoryPage
            gets a `key` matching its category — without it, React
            Router reuses the very same CategoryPage instance when you
            click from one of these to another (they're the same
            component type in the same spot in the tree), so its
            internal state doesn't reset: the lazy-loaded full-res
            images stay cached under their slot numbers (1, 2, 3…),
            which every category restarts from, so the grid kept
            showing the previous category's actual photos where the
            slot numbers matched. The key forces a clean remount on
            every switch. */}
        <Route
          path='/event'
          element={<CategoryPage key='event' category='event' eyebrow='02' />}
        />
        <Route
          path='/table'
          element={<CategoryPage key='table' category='table' eyebrow='03' />}
        />
        <Route
          path='/on-set'
          element={<CategoryPage key='onset' category='onset' eyebrow='04' />}
        />

        {/* Admin route */}
        <Route path='/admin' element={<Admin />} />

        {/* Fallback */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>

      {showContact && <Contacts handleContactClick={handleContactClick} />}
    </>
  );
};

function App() {
  return (
    <ImageProvider>
      <Router>
        <div
          style={{
            minHeight: '100dvh',
            // '100vw' includes the scrollbar's own width in most
            // browsers, which was pushing the page wider than the
            // actual viewport (a faint horizontal overflow you could
            // nudge the page sideways to see). '100%' of the flex
            // body correctly excludes it.
            width: '100%',
          }}>
          <AppContent />
        </div>
      </Router>
    </ImageProvider>
  );
}

export default App;
