import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-book-open me-2"></i>
          The Library
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Main Navigation - Only Home, Books, Games */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="fas fa-home me-1"></i>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/books">
                <i className="fas fa-book me-1"></i>
                Books
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/games">
                <i className="fas fa-gamepad me-1"></i>
                Games
              </Link>
            </li>
          </ul>
          
          {/* Right side - Theme toggle and user menu */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <button 
                className="theme-toggle nav-link border-0 bg-transparent"
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="fas fa-user me-1"></i>
                    {user?.username}
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <span className="dropdown-item-text">
                        <small>Role: {user?.role}</small>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/settings">
                        <i className="fas fa-cog me-1"></i>
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/notifications">
                        <i className="fas fa-bell me-1"></i>
                        Notifications
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt me-1"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    <i className="fas fa-user-plus me-1"></i>
                    Sign Up
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