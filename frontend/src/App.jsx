import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Viajes from './pages/Viajes';
import Catalogos from './pages/Catalogos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="viajes" element={<Viajes />} />
          <Route path="catalogos" element={<Catalogos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
