import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import RoomInput from './pages/RoomInput';
import Canvas from './pages/Canvas';
import Designs from './pages/Designs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/room-input" element={<RoomInput />} />
            <Route path="/canvas" element={<Canvas />} />
            <Route path="/designs" element={<Designs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}