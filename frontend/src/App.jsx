import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Viajes from './pages/Viajes';
import Catalogos from './pages/Catalogos';
import Clientes from './pages/Catalogos/Clientes';
import Ubicaciones from './pages/Catalogos/Ubicaciones';
import Operadores from './pages/Catalogos/Operadores';
import Vehiculos from './pages/Catalogos/Vehiculos';
import Remolques from './pages/Catalogos/Remolques';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/viajes" replace />} />
          <Route path="viajes" element={<Viajes />} />
          <Route path="catalogos" element={<Catalogos />} />
          <Route path="catalogos/clientes" element={<Clientes />} />
          <Route path="catalogos/ubicaciones" element={<Ubicaciones />} />
          <Route path="catalogos/operadores" element={<Operadores />} />
          <Route path="catalogos/vehiculos" element={<Vehiculos />} />
          <Route path="catalogos/remolques" element={<Remolques />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}