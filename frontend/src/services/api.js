import axios from 'axios';

const API_BASE_URL = 'http://localhost:1412/API';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Add request interceptor to include user ID for protected routes
api.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    
    // List of public endpoints that don't need authentication
    const publicEndpoints = ['/books', '/games', '/login', '/signup', '/logout'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url.startsWith(endpoint) && config.method === 'get'
    );
    
    // Debug logging
    console.log('🔐 API Request:', {
      method: config.method,
      url: config.url,
      isPublicEndpoint,
      hasUser: !!user,
      userId: user?._id
    });
    
    // Only add authentication for protected routes
    if (user && user._id && !isPublicEndpoint) {
      // For GET and PUT requests to protected routes, add userId to headers
      if (config.method === 'get' || config.method === 'put') {
        config.headers['x-user-id'] = user._id;
        console.log('🔐 Added x-user-id header for', config.method.toUpperCase(), ':', user._id);
      }
      // For DELETE requests, add userId to query params
      if (config.method === 'delete') {
        config.params = { ...config.params, userId: user._id };
        console.log('🔐 Added userId to params:', user._id);
      }
      // For POST requests that don't use FormData, add to headers
      if (config.method === 'post' && config.headers['Content-Type'] === 'application/json') {
        config.headers['x-user-id'] = user._id;
        console.log('🔐 Added x-user-id header for POST:', user._id);
      }
    }
    return config;
  },
  (error) => {
    console.error('🔐 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      dataType: typeof response.data,
      hasDataProperty: 'data' in response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  signup: (userData) => api.post('/signup', userData),
  logout: () => api.get('/logout'),
};

// Books API
export const booksAPI = {
  getAll: () => {
    console.log('📚 Fetching all books...');
    return api.get('/books');
  },
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const formData = new FormData();
    // Add userId for authentication
    formData.append('userId', currentUser._id);
    
    Object.keys(bookData).forEach(key => {
      if (bookData[key] !== null && bookData[key] !== undefined && key !== 'currentImageUrl') {
        if (key === 'readingLinks') {
          formData.append(key, JSON.stringify(bookData[key]));
        } else {
          formData.append(key, bookData[key]);
        }
      }
    });
    
    return api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, bookData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const formData = new FormData();
    // Add userId for authentication
    formData.append('userId', currentUser._id);
    
    Object.keys(bookData).forEach(key => {
      if (bookData[key] !== null && bookData[key] !== undefined && key !== 'currentImageUrl') {
        if (key === 'readingLinks') {
          formData.append(key, JSON.stringify(bookData[key]));
        } else {
          formData.append(key, bookData[key]);
        }
      }
    });
    
    return api.put(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.delete(`/books/${id}`);
  },
};

// Games API
export const gamesAPI = {
  getAll: () => {
    console.log('🎮 Fetching all games...');
    return api.get('/games');
  },
  getById: (id) => api.get(`/games/${id}`),
  create: (gameData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const formData = new FormData();
    // Add userId for authentication
    formData.append('userId', currentUser._id);
    
    Object.keys(gameData).forEach(key => {
      if (gameData[key] !== null && gameData[key] !== undefined && key !== 'currentImageUrl') {
        if (key === 'platformLinks') {
          formData.append(key, JSON.stringify(gameData[key]));
        } else {
          formData.append(key, gameData[key]);
        }
      }
    });
    
    return api.post('/games', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, gameData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const formData = new FormData();
    // Add userId for authentication
    formData.append('userId', currentUser._id);
    
    Object.keys(gameData).forEach(key => {
      if (gameData[key] !== null && gameData[key] !== undefined && key !== 'currentImageUrl') {
        if (key === 'platformLinks') {
          formData.append(key, JSON.stringify(gameData[key]));
        } else {
          formData.append(key, gameData[key]);
        }
      }
    });
    
    return api.put(`/games/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.delete(`/games/${id}`);
  },
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.post('/users', {
      ...userData,
      userId: currentUser._id
    });
  },
  update: (id, userData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.put(`/users/${id}`, {
      ...userData,
      userId: currentUser._id
    });
  },
  delete: (id) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.delete(`/users/${id}`);
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: () => {
    const user = getCurrentUser();
    if (!user) {
      console.warn('🔔 No user found for notifications request');
      return Promise.reject(new Error('User not authenticated'));
    }
    console.log('🔔 Fetching notifications for user:', user._id);
    return api.get('/notifications');
  },
  getAdminNotifications: () => {
    const user = getCurrentUser();
    if (!user) {
      console.warn('👑 No user found for admin notifications request');
      return Promise.reject(new Error('User not authenticated'));
    }
    if (user.role !== 'admin') {
      console.warn('👑 User is not admin:', user.role);
      return Promise.reject(new Error('Admin access required'));
    }
    console.log('👑 Fetching admin notifications for user:', user._id);
    return api.get('/admin/notifications');
  },
  markAsRead: (id) => {
    const user = getCurrentUser();
    if (!user) {
      console.error('🔔 markAsRead: No user found');
      return Promise.reject(new Error('User not authenticated'));
    }
    console.log('🔔 markAsRead: User found:', user._id);
    console.log('🔔 markAsRead: Making PUT request to /notifications/' + id + '/read');
    return api.put(`/notifications/${id}/read`, {});
  },
  markAllAsRead: () => {
    const user = getCurrentUser();
    if (!user) {
      console.error('🔔 markAllAsRead: No user found');
      return Promise.reject(new Error('User not authenticated'));
    }
    console.log('🔔 markAllAsRead: User found:', user._id);
    console.log('🔔 markAllAsRead: Making PUT request to /notifications/mark-all-read');
    return api.put('/notifications/mark-all-read', {});
  },
  clearAllNotifications: () => {
    const user = getCurrentUser();
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }
    if (user.role !== 'admin') {
      return Promise.reject(new Error('Admin access required'));
    }
    console.log('🗑️ Clearing all notifications for admin:', user._id);
    return api.delete('/admin/notifications/clear-all');
  },
};

// Submissions API
export const submissionsAPI = {
  submit: (submissionData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const formData = new FormData();
    // Add userId for authentication
    formData.append('userId', currentUser._id);
    
    Object.keys(submissionData).forEach(key => {
      if (submissionData[key] !== null && submissionData[key] !== undefined) {
        if (key === 'readingLinks' || key === 'platformLinks') {
          formData.append(key, JSON.stringify(submissionData[key]));
        } else {
          formData.append(key, submissionData[key]);
        }
      }
    });
    
    return api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: () => {
    const user = getCurrentUser();
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }
    return api.get('/submissions');
  },
  getPending: () => {
    const user = getCurrentUser();
    if (!user) {
      console.warn('📝 No user found for pending submissions request');
      return Promise.reject(new Error('User not authenticated'));
    }
    console.log('📝 Fetching pending submissions for user:', user._id);
    return api.get('/submissions/pending');
  },
  getMy: () => {
    const user = getCurrentUser();
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }
    return api.get('/my-submissions');
  },
  approve: (id, reviewNotes = '') => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.put(`/submissions/${id}/approve`, {
      reviewNotes,
      userId: currentUser._id
    });
  },
  reject: (id, reviewNotes = '') => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.put(`/submissions/${id}/reject`, {
      reviewNotes,
      userId: currentUser._id
    });
  },
};

// Edit Requests API
export const editRequestsAPI = {
  submit: (editRequestData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.post('/edit-requests', {
      ...editRequestData,
      userId: currentUser._id
    });
  },
  getAll: () => {
    const user = getCurrentUser();
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }
    return api.get('/edit-requests');
  },
  getPending: () => {
    const user = getCurrentUser();
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }
    return api.get('/edit-requests/pending');
  },
  getMy: () => {
    const user = getCurrentUser();
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }
    return api.get('/my-edit-requests');
  },
  getMyPublishedContent: () => {
    const user = getCurrentUser();
    if (!user) {
      return Promise.reject(new Error('User not authenticated'));
    }
    return api.get('/my-published-content');
  },
  approve: (id, reviewNotes = '') => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.put(`/edit-requests/${id}/approve`, {
      reviewNotes,
      userId: currentUser._id
    });
  },
  reject: (id, reviewNotes = '') => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return api.put(`/edit-requests/${id}/reject`, {
      reviewNotes,
      userId: currentUser._id
    });
  },
};

// Favorites API functions - Updated to use basic authentication system
const getUserFavorites = () => {
  console.log('❤️ Fetching user favorites...');
  return api.get('/favorites');
};

const addToFavorites = (contentId, contentType) => {
  console.log('❤️ Adding to favorites:', { contentId, contentType });
  return api.post('/favorites/add', { contentId, contentType });
};

const removeFromFavorites = (contentId, contentType) => {
  console.log('💔 Removing from favorites:', { contentId, contentType });
  return api.post('/favorites/remove', { contentId, contentType });
};

const checkFavorite = (contentId, contentType) => {
  console.log('🔍 Checking favorite status:', { contentId, contentType });
  return api.get(`/favorites/check?contentId=${contentId}&contentType=${contentType}`);
};

const toggleFavorite = (contentId, contentType) => {
  console.log('🔄 Toggling favorite:', { contentId, contentType });
  return api.post('/favorites/toggle', { contentId, contentType });
};

const clearAllFavorites = () => {
  console.log('🗑️ Clearing all favorites...');
  return api.delete('/favorites/clear');
};

const getFavoritesCount = () => {
  console.log('📊 Getting favorites count...');
  return api.get('/favorites/count');
};

// Favorites API
export const favoritesAPI = {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
  toggleFavorite,
  clearAllFavorites,
  getFavoritesCount
};

// User API functions - Updated to use basic authentication system
const getUserProfile = () => {
  console.log('👤 Fetching user profile...');
  return api.get('/user/profile');
};

const updateUserProfile = (profileData) => {
  console.log('📝 Updating user profile...');
  return api.put('/user/profile', profileData);
};

const changePassword = (passwordData) => {
  console.log('🔒 Changing password...');
  return api.put('/user/change-password', passwordData);
};

const deleteUserAccount = (password) => {
  console.log('🗑️ Deleting user account...');
  return api.delete('/user/account', { data: { password } });
};

export const userAPI = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount
};

export default api;