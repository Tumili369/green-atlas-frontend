import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar     from './components/Navbar';
import Home       from './pages/Home';
import Explore    from './pages/Explore';
import MapPage    from './pages/MapPage';
import TreeDetail from './pages/TreeDetail';
import Login      from './pages/Login';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/explore"  element={<Explore />} />
        <Route path="/map"      element={<MapPage />} />
        <Route path="/tree/:id" element={<TreeDetail />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/admin"    element={<AdminPanel />} />
      </Routes>
    </AuthProvider>
  );
}
