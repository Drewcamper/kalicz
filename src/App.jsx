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
            position: 'fixed',
            left: '0',
            top: '0',
            margin: '0',
            padding: '0',
          }}>
          <Menu onContactClick={handleContactClick} />
          <Routes>
            <Route path='/' element={<Slideshow />} />
            <Route path='/admin' element={<Admin />} />
            <Route path='/index' element={<IndexPage />} />
          </Routes>
        </div>
        {showContact && <Contacts handleContactClick={handleContactClick} />}
      </Router>
    </ImageProvider>
  );
}

export default App;
