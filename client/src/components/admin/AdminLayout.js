import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🎓 Admin Panel</h2>
          <p>Punjab Alumni Portal</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin/dashboard" className="nav-link">
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="nav-link">
                <span className="nav-icon">👥</span>
                Users
              </Link>
            </li>
            <li>
              <Link to="/admin/events" className="nav-link">
                <span className="nav-icon">📅</span>
                Events
              </Link>
            </li>
            <li>
              <Link to="/admin/jobs" className="nav-link">
                <span className="nav-icon">💼</span>
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/admin/news" className="nav-link">
                <span className="nav-icon">📰</span>
                News
              </Link>
            </li>
            <li>
              <Link to="/admin/donations" className="nav-link">
                <span className="nav-icon">💰</span>
                Donations
              </Link>
            </li>
            <li className="nav-divider"></li>
            <li>
              <Link to="/dashboard" className="nav-link">
                <span className="nav-icon">👤</span>
                User Dashboard
              </Link>
            </li>
            <li>
              <Link to="/" className="nav-link">
                <span className="nav-icon">🏠</span>
                Public Site
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>Admin: {user?.first_name}</p>
          <button onClick={handleLogout} className="btn btn-sm btn-danger">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <div className="header-actions">
              <span className="admin-badge">Administrator</span>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-outline"
              >
                Switch to User View
              </button>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;