// src/App.tsx
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import PrivateLayout from './layouts/PrivateLayout';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<PrivateLayout />}>
        <Route path="/home" element={<Home />} />
        {/* ⬆️ Add more protected routes here, patient/doctor/admin groups */}
      </Route>
    </Routes>
  );
}

export default App;
