import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-leaf">🌿</span>
        <span className="brand-text">Green<em>Atlas</em></span>
      </Link>

      <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/"        className={isActive('/')        ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/explore" className={isActive('/explore') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Explore</Link>
        <Link to="/map"     className={isActive('/map')     ? 'active' : ''} onClick={() => setMenuOpen(false)}>Map</Link>
        {isAdmin && (
          <Link to="/admin" className={`nav-admin ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Admin Panel
          </Link>
        )}
        {user ? (
          <div className="nav-user">
            <span className="nav-username">{user.username}</span>
            <button onClick={handleLogout} className="btn-logout">Sign out</button>
          </div>
        ) : (
          <Link to="/login" className="btn-nav-login" onClick={() => setMenuOpen(false)}>Sign in</Link>
        )}
      </div>
    </nav>
  );
}
