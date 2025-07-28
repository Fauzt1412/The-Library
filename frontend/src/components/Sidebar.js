import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useSidebarContext } from '../context/SidebarContext';

const Sidebar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { favoritesCount } = useFavorites();
  const { isVisible, isCollapsed, toggleSidebar, toggleCollapse } = useSidebarContext();
  const location = useLocation();



  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isVisible ? 'show' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <button 
              className="sidebar-toggle"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
            {!isCollapsed && (
              <h5 className="sidebar-title">
                <i className="fas fa-bars me-2"></i>
                Navigation
              </h5>
            )}
          </div>
          
          <button 
            className="sidebar-close"
            onClick={toggleSidebar}
            title="Close Sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content">
          {/* Account Section */}
          <div className="sidebar-section">
            {!isCollapsed && <h6 className="sidebar-section-title">Account</h6>}
            
            <div className="sidebar-links">
              <Link 
                to="/settings" 
                className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
                title="Settings"
              >
                <i className="fas fa-cog"></i>
                {!isCollapsed && <span>Settings</span>}
              </Link>

              {isAuthenticated ? (
                <Link 
                  to="/notifications" 
                  className={`sidebar-link ${isActive('/notifications') ? 'active' : ''}`}
                  title="Notifications"
                >
                  <i className="fas fa-bell"></i>
                  {!isCollapsed && <span>Notifications</span>}
                </Link>
              ) : (
                <div 
                  className="sidebar-link disabled"
                  title="Login required"
                >
                  <i className="fas fa-bell"></i>
                  {!isCollapsed && <span>Notifications</span>}
                  {!isCollapsed && <small className="login-required">Login required</small>}
                </div>
              )}

              {isAuthenticated ? (
                <Link 
                  to="/my-content" 
                  className={`sidebar-link ${isActive('/my-content') ? 'active' : ''}`}
                  title="My Content"
                >
                  <i className="fas fa-edit"></i>
                  {!isCollapsed && <span>My Content</span>}
                </Link>
              ) : (
                <div 
                  className="sidebar-link disabled"
                  title="Login required"
                >
                  <i className="fas fa-edit"></i>
                  {!isCollapsed && <span>My Content</span>}
                  {!isCollapsed && <small className="login-required">Login required</small>}
                </div>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <div className="sidebar-section">
            {!isCollapsed && <h6 className="sidebar-section-title">Browse</h6>}
            
            <div className="sidebar-links">
              {isAuthenticated ? (
                <Link 
                  to="/favorites" 
                  className={`sidebar-link ${isActive('/favorites') ? 'active' : ''}`}
                  title="Favorites"
                >
                  <i className="fas fa-heart"></i>
                  {!isCollapsed && (
                    <span>
                      Favorites
                      {favoritesCount > 0 && (
                        <span className="badge bg-danger ms-2">{favoritesCount}</span>
                      )}
                    </span>
                  )}
                  {isCollapsed && favoritesCount > 0 && (
                    <span className="badge bg-danger sidebar-badge">{favoritesCount}</span>
                  )}
                </Link>
              ) : (
                <div 
                  className="sidebar-link disabled"
                  title="Login required"
                >
                  <i className="fas fa-heart"></i>
                  {!isCollapsed && (
                    <span>
                      Favorites
                      <small className="login-required">Login / Sign up to use</small>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Management */}
          <div className="sidebar-section">
            {!isCollapsed && <h6 className="sidebar-section-title">Content</h6>}
            
            <div className="sidebar-links">
              {isAuthenticated ? (
                <Link 
                  to="/submit" 
                  className={`sidebar-link ${isActive('/submit') ? 'active' : ''}`}
                  title="Submit Content"
                >
                  <i className="fas fa-upload"></i>
                  {!isCollapsed && <span>Submit Content</span>}
                </Link>
              ) : (
                <div 
                  className="sidebar-link disabled"
                  title="Login required"
                >
                  <i className="fas fa-upload"></i>
                  {!isCollapsed && <span>Submit Content</span>}
                  {!isCollapsed && <small className="login-required">Login required</small>}
                </div>
              )}
            </div>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="sidebar-section">
              {!isCollapsed && <h6 className="sidebar-section-title">Administration</h6>}
              
              <div className="sidebar-links">
                <Link 
                  to="/admin" 
                  className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
                  title="Admin Panel"
                >
                  <i className="fas fa-shield-alt"></i>
                  {!isCollapsed && <span>Admin Panel</span>}
                </Link>
              </div>
            </div>
          )}


        </div>
      </div>


    </>
  );
};

export default Sidebar;