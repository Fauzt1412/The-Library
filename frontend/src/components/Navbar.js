import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-expanded={showMobileMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${showMobileMenu ? 'show' : ''}`} id="navbarNav">
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
                    
                    {/* Mobile-only sidebar menu items */}
                    <li className="d-block d-md-none">
                      <h6 className="dropdown-header">Account</h6>
                    </li>
                    <li className="d-block d-md-none">
                      <Link className="dropdown-item" to="/settings" onClick={() => setShowMobileMenu(false)}>
                        <i className="fas fa-cog me-2"></i>
                        Settings
                      </Link>
                    </li>
                    <li className="d-block d-md-none">
                      <Link className="dropdown-item" to="/notifications" onClick={() => setShowMobileMenu(false)}>
                        <i className="fas fa-bell me-2"></i>
                        Notifications
                      </Link>
                    </li>
                    <li className="d-block d-md-none">
                      <Link className="dropdown-item" to="/my-content" onClick={() => setShowMobileMenu(false)}>
                        <i className="fas fa-user-edit me-2"></i>
                        My Content
                      </Link>
                    </li>
                    
                    <li className="d-block d-md-none"><hr className="dropdown-divider" /></li>
                    <li className="d-block d-md-none">
                      <h6 className="dropdown-header">Browse</h6>
                    </li>
                    <li className="d-block d-md-none">
                      <Link className="dropdown-item" to="/favorites" onClick={() => setShowMobileMenu(false)}>
                        <i className="fas fa-heart me-2"></i>
                        Favorites
                        {favoritesCount > 0 && (
                          <span className="badge bg-danger ms-2">{favoritesCount}</span>
                        )}
                      </Link>
                    </li>
                    
                    <li className="d-block d-md-none"><hr className="dropdown-divider" /></li>
                    <li className="d-block d-md-none">
                      <h6 className="dropdown-header">Content</h6>
                    </li>
                    <li className="d-block d-md-none">
                      <Link className="dropdown-item" to="/submit" onClick={() => setShowMobileMenu(false)}>
                        <i className="fas fa-plus me-2"></i>
                        Submit Content
                      </Link>
                    </li>
                    
                    {isAdmin && (
                      <>
                        <li className="d-block d-md-none"><hr className="dropdown-divider" /></li>
                        <li className="d-block d-md-none">
                          <h6 className="dropdown-header">Administration</h6>
                        </li>
                        <li className="d-block d-md-none">
                          <Link className="dropdown-item" to="/admin" onClick={() => setShowMobileMenu(false)}>
                            <i className="fas fa-shield-alt me-2"></i>
                            Admin Panel
                          </Link>
                        </li>
                      </>
                    )}
                    
                    {/* Desktop-only items */}
                    <li className="d-none d-md-block">
                      <Link className="dropdown-item" to="/settings">
                        <i className="fas fa-cog me-1"></i>
                        Settings
                      </Link>
                    </li>
                    <li className="d-none d-md-block">
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