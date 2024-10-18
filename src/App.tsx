// src/App.tsx
import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import HomeScreen from './Screens/Home/HomeScreen';
import CameraView1 from './Screens/CameraView1';
import CameraView2 from './Screens/CameraView2';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Define Routes */}
        <Route path="/" element={<HomeScreen />} />   {/* Home page */}
        <Route path="/page-two" element={<CameraView1 />} />   {/* Another page */}
        <Route path="/page-one" element={<CameraView2 />} />   {/* Another page */}

      </Routes>
    </div>
  );
}

export default App;
