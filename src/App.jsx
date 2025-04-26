import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Admin } from './admin/Admin';
import Home from './home/Home';
import Contacts from './home/contacts';

import { ImageProvider } from './context';

function App() {
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
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/admin' element={<Admin />} />
            <Route path='/contacts' element={<Contacts />} />
          </Routes>
        </div>
      </Router>
    </ImageProvider>
  );
}

export default App;
