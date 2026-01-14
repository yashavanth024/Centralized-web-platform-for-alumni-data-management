import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text"> Alumni Connect</span>
          </Link>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-links">
            <li><Link to="/">Home</Link></li>

            {user ? (
              <>
                {/* 🎓 Student Links */}
                {user.role === 'student' && (
                  <>
                    <li><Link to="/mentorship">Mentorship</Link></li>
                    <li><Link to="/jobs">Jobs</Link></li>
                    <li><Link to="/student/dashboard">Dashboard</Link></li>
                  </>
                )}

                {/* 👨‍🎓 Alumni Links */}
                {user.role === 'alumni' && (
                  <>
                    <li><Link to="/mentorship/create">Create Mentorship</Link></li>
                    <li><Link to="/jobs/my">My Jobs</Link></li>
                    <li><Link to="/alumni/dashboard">Dashboard</Link></li>
                  </>
                )}

                {/* 🛠 Admin Link */}
                {user.role === 'admin' && (
                  <li>
                    <Link to="/admin" className="btn btn-warning">
                      Admin Panel
                    </Link>
                  </li>
                )}

                {/* 🌐 Common Links */}
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/alumni">Alumni</Link></li>
                <li><Link to="/news">News</Link></li>
                <li><Link to="/donations">Donate</Link></li>
                <li><Link to="/profile">Profile</Link></li>

                <li>
                  <button onClick={handleLogout} className="btn btn-danger">
                    Logout
                  </button>
                </li>

                <li className="user-greeting">
                  {user.first_name} ({user.role})
                </li>
              </>
            ) : (
              <>
                <li><Link to="/alumni">Alumni</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/news">News</Link></li>
                <li><Link to="/donations">Donate</Link></li>
                <li><Link to="/login" className="btn">Login</Link></li>
                <li>
                  <Link to="/register" className="btn btn-primary">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
