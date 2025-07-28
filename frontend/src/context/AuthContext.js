import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('🔐 Restored user from localStorage:', userData.username);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login with:', credentials.username);
      
      const response = await fetch('http://localhost:1412/API/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (response.ok && data.user) {
        console.log('✅ Login successful:', data.user.username);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        console.error('❌ Login failed:', data.error);
        return { 
          success: false, 
          error: data.error || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('❌ Login network error:', error);
      return { 
        success: false, 
        error: 'Network error: ' + error.message 
      };
    }
  };

  const signup = async (userData) => {
    try {
      console.log('📝 Attempting signup with:', userData.username);
      
      const response = await fetch('http://localhost:1412/API/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Signup successful');
        return { success: true, message: data.message };
      } else {
        console.error('❌ Signup failed:', data.error);
        return { 
          success: false, 
          error: data.error || 'Signup failed' 
        };
      }
    } catch (error) {
      console.error('❌ Signup network error:', error);
      return { 
        success: false, 
        error: 'Network error: ' + error.message 
      };
    }
  };

  const logout = () => {
    console.log('👋 Logging out user:', user?.username);
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    console.log('📝 Updating user data:', updatedUserData.username);
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    loading,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};