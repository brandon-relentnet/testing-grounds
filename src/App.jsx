// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Theme from './features/theme/Theme';
import Settings from './pages/Settings';
import Accent from './features/accent/Accent';
import FontFamily from './features/font-family/FontFamily';
import NavBar from './components/NavBar';
import Fantasy from './pages/Fantasy'

function App() {
  return (
    <Router>
      <Theme /> 
      <Accent />
      <FontFamily />
      
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/fantasy" element={<Fantasy />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
