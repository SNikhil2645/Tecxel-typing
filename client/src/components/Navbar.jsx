import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { participant, isAuthenticated, logout, isAdminAuthenticated, adminLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo-badge">TCX</span>
          <span className="navbar-title">
            TECXEL <span>TYPING</span>
          </span>
        </Link>

        <ul className="navbar-links">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/rules" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Rules
            </NavLink>
          </li>
          <li>
            <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Leaderboard
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <div className="nav-user-pill">
                  <span className="pixel-cube"></span>
                  <span className="nav-user-id">{participant?.participantId}</span>
                </div>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Login
                </NavLink>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Register
                </Link>
              </li>
            </>
          )}

          {isAdminAuthenticated ? (
            <li>
              <button onClick={handleAdminLogout} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                Admin Exit
              </button>
            </li>
          ) : (
            <li>
              <NavLink to="/admin" className="nav-link" style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                Admin
              </NavLink>
            </li>
          )}
        </ul>
      </div>
      <div className="tecxl-ribbon tecxl-ribbon-slim"></div>
    </nav>
  );
}
