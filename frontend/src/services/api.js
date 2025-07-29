import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1412';
const API_FULL_URL = `${API_BASE_URL}/API`;

const api = axios.create({
  baseURL: API_FULL_URL,
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
    
    console.log('📚 booksAPI.create - Input data:', {
      coverImageType: typeof bookData.coverImage,
      hasCloudinaryData: !!bookData.cloudinaryData,
      cloudinaryData: bookData.cloudinaryData
    });
    
    // Check if we have Cloudinary data or traditional file upload
    const hasCloudinaryData = bookData.cloudinaryData && bookData.cloudinaryData.publicId;
    const hasFileUpload = bookData.coverImage instanceof File;
    
    console.log('📚 Upload type:', { hasCloudinaryData, hasFileUpload });
    
    if (hasCloudinaryData) {
      // For Cloudinary uploads, use JSON
      console.log('📚 Using JSON for Cloudinary book creation');
      return api.post('/books', {
        userId: currentUser._id,
        title: bookData.title,
        author: bookData.author,
        categories: bookData.categories,
        description: bookData.description,
        publishedDate: bookData.publishedDate,
        coverImageUrl: bookData.coverImage, // Cloudinary URL
        cloudinaryData: bookData.cloudinaryData,
        readingLinks: bookData.readingLinks || []
      });
    } else {
      // For traditional file uploads, use FormData
      console.log('📚 Using FormData for traditional book creation');
      const formData = new FormData();
      formData.append('userId', currentUser._id);
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('categories', bookData.categories);
      formData.append('description', bookData.description);
      formData.append('publishedDate', bookData.publishedDate);
      
      if (bookData.coverImage) {
        formData.append('coverImage', bookData.coverImage);
      }
      
      if (bookData.readingLinks) {
        formData.append('readingLinks', JSON.stringify(bookData.readingLinks));
      }
      
      return api.post('/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
  },
  update: (id, bookData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    console.log('📚 booksAPI.update - Input data:', {
      id,
      coverImageType: typeof bookData.coverImage,
      hasCloudinaryData: !!bookData.cloudinaryData,
      cloudinaryData: bookData.cloudinaryData
    });
    
    // Check if we have Cloudinary data or traditional file upload
    const hasCloudinaryData = bookData.cloudinaryData && bookData.cloudinaryData.publicId;
    const hasFileUpload = bookData.coverImage instanceof File;
    
    console.log('📚 Update type:', { hasCloudinaryData, hasFileUpload });
    
    if (hasCloudinaryData) {
      // For Cloudinary uploads, use JSON
      console.log('📚 Using JSON for Cloudinary book update');
      return api.put(`/books/${id}`, {
        userId: currentUser._id,
        title: bookData.title,
        author: bookData.author,
        categories: bookData.categories,
        description: bookData.description,
        publishedDate: bookData.publishedDate,
        coverImageUrl: bookData.coverImage, // Cloudinary URL
        cloudinaryData: bookData.cloudinaryData,
        readingLinks: bookData.readingLinks || []
      });
    } else {
      // For traditional file uploads, use FormData
      console.log('📚 Using FormData for traditional book update');
      const formData = new FormData();
      formData.append('userId', currentUser._id);
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('categories', bookData.categories);
      formData.append('description', bookData.description);
      formData.append('publishedDate', bookData.publishedDate);
      
      if (bookData.coverImage) {
        formData.append('coverImage', bookData.coverImage);
      }
      
      if (bookData.readingLinks) {
        formData.append('readingLinks', JSON.stringify(bookData.readingLinks));
      }
      
      return api.put(`/books/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
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
    
    console.log('🎮 gamesAPI.create - Input data:', {
      coverImageType: typeof gameData.coverImage,
      hasCloudinaryData: !!gameData.cloudinaryData,
      cloudinaryData: gameData.cloudinaryData
    });
    
    // Check if we have Cloudinary data or traditional file upload
    const hasCloudinaryData = gameData.cloudinaryData && gameData.cloudinaryData.publicId;
    const hasFileUpload = gameData.coverImage instanceof File;
    
    console.log('🎮 Upload type:', { hasCloudinaryData, hasFileUpload });
    
    if (hasCloudinaryData) {
      // For Cloudinary uploads, use JSON
      console.log('🎮 Using JSON for Cloudinary game creation');
      return api.post('/games', {
        userId: currentUser._id,
        title: gameData.title,
        developer: gameData.developer,
        genre: gameData.genre,
        platform: gameData.platform,
        description: gameData.description,
        releaseDate: gameData.releaseDate,
        coverImageUrl: gameData.coverImage, // Cloudinary URL
        cloudinaryData: gameData.cloudinaryData,
        platformLinks: gameData.platformLinks || []
      });
    } else {
      // For traditional file uploads, use FormData
      console.log('🎮 Using FormData for traditional game creation');
      const formData = new FormData();
      formData.append('userId', currentUser._id);
      formData.append('title', gameData.title);
      formData.append('developer', gameData.developer);
      formData.append('genre', gameData.genre);
      formData.append('platform', gameData.platform);
      formData.append('description', gameData.description);
      formData.append('releaseDate', gameData.releaseDate);
      
      if (gameData.coverImage) {
        formData.append('coverImage', gameData.coverImage);
      }
      
      if (gameData.platformLinks) {
        formData.append('platformLinks', JSON.stringify(gameData.platformLinks));
      }
      
      return api.post('/games', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
  },
  update: (id, gameData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    console.log('🎮 gamesAPI.update - Input data:', {
      id,
      coverImageType: typeof gameData.coverImage,
      hasCloudinaryData: !!gameData.cloudinaryData,
      cloudinaryData: gameData.cloudinaryData
    });
    
    // Check if we have Cloudinary data or traditional file upload
    const hasCloudinaryData = gameData.cloudinaryData && gameData.cloudinaryData.publicId;
    const hasFileUpload = gameData.coverImage instanceof File;
    
    console.log('🎮 Update type:', { hasCloudinaryData, hasFileUpload });
    
    if (hasCloudinaryData) {
      // For Cloudinary uploads, use JSON
      console.log('🎮 Using JSON for Cloudinary game update');
      return api.put(`/games/${id}`, {
        userId: currentUser._id,
        title: gameData.title,
        developer: gameData.developer,
        genre: gameData.genre,
        platform: gameData.platform,
        description: gameData.description,
        releaseDate: gameData.releaseDate,
        coverImageUrl: gameData.coverImage, // Cloudinary URL
        cloudinaryData: gameData.cloudinaryData,
        platformLinks: gameData.platformLinks || []
      });
    } else {
      // For traditional file uploads, use FormData
      console.log('🎮 Using FormData for traditional game update');
      const formData = new FormData();
      formData.append('userId', currentUser._id);
      formData.append('title', gameData.title);
      formData.append('developer', gameData.developer);
      formData.append('genre', gameData.genre);
      formData.append('platform', gameData.platform);
      formData.append('description', gameData.description);
      formData.append('releaseDate', gameData.releaseDate);
      
      if (gameData.coverImage) {
        formData.append('coverImage', gameData.coverImage);
      }
      
      if (gameData.platformLinks) {
        formData.append('platformLinks', JSON.stringify(gameData.platformLinks));
      }
      
      return api.put(`/games/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
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
    
    console.log('📤 Submitting data:', submissionData);
    
    // Check if we have Cloudinary data or traditional file upload
    const hasCloudinaryData = submissionData.cloudinaryData && submissionData.cloudinaryData.publicId;
    const hasFileUpload = submissionData.coverImage instanceof File;
    
    console.log('📤 Upload type:', { hasCloudinaryData, hasFileUpload });
    
    if (hasCloudinaryData) {
      // For Cloudinary uploads, use JSON
      console.log('📤 Using JSON for Cloudinary submission');
      return api.post('/submissions', {
        userId: currentUser._id,
        type: submissionData.type,
        title: submissionData.title,
        description: submissionData.description,
        coverImageUrl: submissionData.coverImage, // Cloudinary URL
        cloudinaryData: submissionData.cloudinaryData,
        ...(submissionData.type === 'book' ? {
          author: submissionData.author,
          categories: submissionData.categories,
          publishedDate: submissionData.publishedDate,
          readingLinks: submissionData.readingLinks || []
        } : {
          developer: submissionData.developer,
          genre: submissionData.genre,
          platform: submissionData.platform,
          releaseDate: submissionData.releaseDate,
          platformLinks: submissionData.platformLinks || []
        })
      });
    } else {
      // For traditional file uploads, use FormData
      console.log('📤 Using FormData for traditional file submission');
      const formData = new FormData();
      formData.append('userId', currentUser._id);
      formData.append('type', submissionData.type);
      formData.append('title', submissionData.title);
      formData.append('description', submissionData.description);
      
      if (submissionData.type === 'book') {
        formData.append('author', submissionData.author);
        formData.append('categories', submissionData.categories);
        formData.append('publishedDate', submissionData.publishedDate);
        if (submissionData.readingLinks) {
          formData.append('readingLinks', JSON.stringify(submissionData.readingLinks));
        }
      } else {
        formData.append('developer', submissionData.developer);
        formData.append('genre', submissionData.genre);
        formData.append('platform', submissionData.platform);
        formData.append('releaseDate', submissionData.releaseDate);
        if (submissionData.platformLinks) {
          formData.append('platformLinks', JSON.stringify(submissionData.platformLinks));
        }
      }
      
      if (submissionData.coverImage) {
        formData.append('coverImage', submissionData.coverImage);
      }
      
      return api.post('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
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
    
    // Always use JSON for edit requests - keep it simple
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