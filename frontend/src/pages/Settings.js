import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Settings = () => {
  const { toggleTheme, isDark } = useTheme();
  const { favoritesCount, clearAllFavorites } = useFavorites();
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  
  // State for user profile (use auth context user as fallback)
  const [userProfile, setUserProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // State for password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // State for account deletion
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Use useCallback to memoize fetchUserProfile function
  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to access settings');
      return;
    }

    try {
      setLoading(true);
      const response = await userAPI.getUserProfile();
      
      // Handle response structure (axios wraps response in .data)
      const responseData = response.data || response;
      if (responseData.success && responseData.user) {
        setUserProfile(responseData.user);
        setProfileForm({
          username: responseData.user.username,
          email: responseData.user.email
        });
        setError('');
      } else {
        setError(responseData.error || 'Failed to load user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initialize user profile from auth context
  useEffect(() => {
    if (user) {
      setUserProfile(user);
      setProfileForm({
        username: user.username || '',
        email: user.email || ''
      });
    } else if (isAuthenticated) {
      // Try to fetch user profile if authenticated but no user data
      fetchUserProfile();
    }
  }, [user, isAuthenticated, fetchUserProfile]);

  const handleClearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      clearAllFavorites();
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      console.log('📝 Submitting profile update:', profileForm);
      const response = await userAPI.updateUserProfile(profileForm);
      
      // Handle response structure (axios wraps response in .data)
      const responseData = response.data || response;
      console.log('✅ Profile update response:', responseData);
      
      if (responseData.success && responseData.user) {
        // Update user profile with the new data
        const updatedUser = {
          ...responseData.user,
          _id: responseData.user.id || responseData.user._id // Handle id vs _id
        };
        
        setUserProfile(updatedUser);
        updateUser(updatedUser); // Update user in auth context
        setProfileSuccess(responseData.message || 'Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        setProfileError(responseData.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      setProfileError(err.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      setPasswordLoading(false);
      return;
    }

    try {
      console.log('🔒 Submitting password change...');
      const response = await userAPI.changePassword(passwordForm);
      
      // Handle response structure (axios wraps response in .data)
      const responseData = response.data || response;
      console.log('✅ Password change response:', responseData);
      
      if (responseData.success) {
        setPasswordSuccess(responseData.message || 'Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
      } else {
        setPasswordError(responseData.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('❌ Error changing password:', err);
      setPasswordError(err.response?.data?.error || err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      console.log('🗑️ Submitting account deletion...');
      const response = await userAPI.deleteUserAccount(deletePassword);
      
      // Handle response structure (axios wraps response in .data)
      const responseData = response.data || response;
      console.log('✅ Account deletion response:', responseData);
      
      if (responseData.success) {
        alert(responseData.message || 'Account deleted successfully. You will be logged out.');
        logout();
      } else {
        setDeleteError(responseData.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error('❌ Error deleting account:', err);
      setDeleteError(err.response?.data?.error || err.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1>Settings</h1>
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">Authentication Required</h4>
            <p>Please log in to access your account settings.</p>
            <a href="/login" className="btn btn-primary">
              <i className="fas fa-sign-in-alt me-1"></i>
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchUserProfile}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">
            <i className="fas fa-cog me-2"></i>
            Settings
          </h1>
          <p className="section-subtitle">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Account Information Section */}
          <div className="card border-0 shadow mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Account Information
              </h5>
            </div>
            <div className="card-body">
              {profileSuccess && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {profileSuccess}
                  <button type="button" className="btn-close" onClick={() => setProfileSuccess('')}></button>
                </div>
              )}
              
              {profileError && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {profileError}
                  <button type="button" className="btn-close" onClick={() => setProfileError('')}></button>
                </div>
              )}

              {!isEditingProfile ? (
                <div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Username:</strong>
                    </div>
                    <div className="col-sm-9">
                      {userProfile?.username || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Email:</strong>
                    </div>
                    <div className="col-sm-9">
                      {userProfile?.email || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Role:</strong>
                    </div>
                    <div className="col-sm-9">
                      <span className={`badge ${userProfile?.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {userProfile?.role || 'user'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>User ID:</strong>
                    </div>
                    <div className="col-sm-9">
                      <code>{userProfile?._id || 'N/A'}</code>
                    </div>
                  </div>
                  
                  {userProfile?.createdAt && (
                    <div className="row mb-3">
                      <div className="col-sm-3">
                        <strong>Member Since:</strong>
                      </div>
                      <div className="col-sm-9">
                        {new Date(userProfile.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          username: userProfile?.username || '',
                          email: userProfile?.email || ''
                        });
                        setProfileError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Account Privacy Section */}
          <div className="card border-0 shadow mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Account Privacy
              </h5>
            </div>
            <div className="card-body">
              {/* Change Password */}
              <div className="mb-4">
                <h6>Change Password</h6>
                <p className="text-muted">Update your password to keep your account secure</p>
                
                {passwordSuccess && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {passwordSuccess}
                    <button type="button" className="btn-close" onClick={() => setPasswordSuccess('')}></button>
                  </div>
                )}
                
                {passwordError && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {passwordError}
                    <button type="button" className="btn-close" onClick={() => setPasswordError('')}></button>
                  </div>
                )}

                {!isChangingPassword ? (
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    <i className="fas fa-key me-1"></i>
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        minLength="6"
                        required
                      />
                      <div className="form-text">Password must be at least 6 characters long</div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-success"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Changing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-1"></i>
                            Change Password
                          </>
                        )}
                      </button>
                      
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setPasswordError('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <hr />

              {/* Delete Account */}
              <div>
                <h6 className="text-danger">Danger Zone</h6>
                <p className="text-muted">Permanently delete your account and all associated data</p>
                
                {deleteError && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {deleteError}
                    <button type="button" className="btn-close" onClick={() => setDeleteError('')}></button>
                  </div>
                )}

                {!isDeleting ? (
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => setIsDeleting(true)}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Delete Account
                  </button>
                ) : (
                  <form onSubmit={handleDeleteAccount}>
                    <div className="mb-3">
                      <label htmlFor="deletePassword" className="form-label">
                        Enter your password to confirm account deletion
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="deletePassword"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-danger"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-trash me-1"></i>
                            Permanently Delete Account
                          </>
                        )}
                      </button>
                      
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsDeleting(false);
                          setDeletePassword('');
                          setDeleteError('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="card border-0 shadow mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-palette me-2"></i>
                Appearance
              </h5>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h6>Theme</h6>
                  <p className="text-muted mb-0">
                    Choose between light and dark mode for better viewing experience
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <div className="form-check form-switch d-flex justify-content-end">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="themeSwitch"
                      checked={isDark}
                      onChange={toggleTheme}
                      style={{ fontSize: '1.2rem' }}
                    />
                    <label className="form-check-label ms-2" htmlFor="themeSwitch">
                      <i className={`fas ${isDark ? 'fa-moon' : 'fa-sun'} me-1`}></i>
                      {isDark ? 'Dark' : 'Light'} Mode
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Favorites Settings */}
          <div className="card border-0 shadow">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-heart me-2"></i>
                Favorites
              </h5>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h6>Manage Favorites</h6>
                  <p className="text-muted mb-0">
                    You currently have <strong>{favoritesCount}</strong> item{favoritesCount !== 1 ? 's' : ''} in your favorites
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <button 
                    className="btn btn-outline-danger"
                    onClick={handleClearFavorites}
                    disabled={favoritesCount === 0}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={toggleTheme}
                >
                  <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} me-2`}></i>
                  Switch to {isDark ? 'Light' : 'Dark'} Mode
                </button>
                
                <a href="/favorites" className="btn btn-outline-secondary">
                  <i className="fas fa-heart me-2"></i>
                  View Favorites ({favoritesCount})
                </a>
                
                <a href="/books" className="btn btn-outline-info">
                  <i className="fas fa-book me-2"></i>
                  Browse Books
                </a>
                
                <a href="/games" className="btn btn-outline-success">
                  <i className="fas fa-gamepad me-2"></i>
                  Browse Games
                </a>
              </div>
              
              <hr />
              
              <div className="text-center">
                <h6>Account Summary</h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="border rounded p-2">
                      <strong>{favoritesCount}</strong>
                      <br />
                      <small className="text-muted">Favorites</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded p-2">
                      <strong>{userProfile?.role || 'user'}</strong>
                      <br />
                      <small className="text-muted">Role</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;