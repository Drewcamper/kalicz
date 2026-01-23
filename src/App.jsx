import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';

import { Admin } from './admin/Admin';
import IndexPage from './home/index/IndexPage';
import { Menu } from './home/menu';
import Contacts from './home/contacts';
import { Slideshow } from './home/slideshow';

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
            height: '100vh',
            width: '100vw',
          }}>
          <AppContent />
        </div>
      </Router>
    </ImageProvider>
  );
}

export default App;
