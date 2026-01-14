import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import { Admin } from './admin/Admin';
import IndexPage from './home/index/IndexPage';
import { Menu } from './home/menu';
import { Slideshow } from './home/slideshow';
import Contacts from './home/contacts';

import { ImageProvider } from './context';

function App() {
  const [showContact, setShowContact] = useState(false);

  const handleContactClick = () => {
    setShowContact(prev => !prev);
  };

  return (
    <ImageProvider>
      <Router>
        <div
          style={{
            height: '100vh',
            width: '100vw',
            // position: 'fixed',
            // overflow: 'hidden', // prevent double scrollbars
            position: 'relative',
          }}>
          <Menu onContactClick={handleContactClick} />
          <div
            style={{
              height: '100%',
              width: '100%',
              overflowY: 'auto', // THIS enables scrolling
              paddingTop: '28px', // space for menu
              boxSizing: 'border-box',
            }}>
            <Routes>
              <Route path='/' element={<Slideshow />} />
              <Route path='/admin' element={<Admin />} />
              <Route path='/index' element={<IndexPage />} />
            </Routes>
          </div>
        </div>
        {showContact && <Contacts handleContactClick={handleContactClick} />}
      </Router>
    </ImageProvider>
  );
}

export default App;
