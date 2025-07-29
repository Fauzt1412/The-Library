// Enhanced API service with Vercel Blob support
import { getCurrentUser } from './api';
import { uploadImageToBlob, deleteImageFromBlob } from '../utils/blobUtils';

// Helper to prepare form data with blob support
const prepareBlobFormData = async (data, userId) => {
  const formData = new FormData();
  formData.append('userId', userId);
  
  // Handle image upload
  if (data.coverImage) {
    if (data.coverImage.type === 'blob' && data.coverImage.blobUrl) {
      // Use blob URL directly
      formData.append('imageUrl', data.coverImage.blobUrl);
      formData.append('imageType', 'blob');
      formData.append('imagePath', data.coverImage.filename || '');
    } else if (data.coverImage.file) {
      // Traditional file upload
      formData.append('coverImage', data.coverImage.file);
      formData.append('imageType', 'traditional');
    } else if (data.coverImage instanceof File) {
      // Direct file object
      formData.append('coverImage', data.coverImage);
      formData.append('imageType', 'traditional');
    }
  }
  
  return formData;
};

// Enhanced Books API with blob support
export const enhancedBooksAPI = {
  create: async (bookData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      const formData = await prepareBlobFormData(bookData, currentUser._id);
      
      // Add book-specific fields
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('categories', bookData.categories);
      formData.append('description', bookData.description);
      formData.append('publishedDate', bookData.publishedDate);
      
      if (bookData.readingLinks) {
        formData.append('readingLinks', JSON.stringify(bookData.readingLinks));
      }
      
      const response = await fetch('/API/books', {
        method: 'POST',
        body: formData,
        headers: {
          'x-user-id': currentUser._id
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating book with blob support:', error);
      throw error;
    }
  },
  
  update: async (id, bookData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      const formData = await prepareBlobFormData(bookData, currentUser._id);
      
      // Add book-specific fields
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('categories', bookData.categories);
      formData.append('description', bookData.description);
      formData.append('publishedDate', bookData.publishedDate);
      
      if (bookData.readingLinks) {
        formData.append('readingLinks', JSON.stringify(bookData.readingLinks));
      }
      
      const response = await fetch(`/API/books/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'x-user-id': currentUser._id
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating book with blob support:', error);
      throw error;
    }
  }
};

// Enhanced Games API with blob support
export const enhancedGamesAPI = {
  create: async (gameData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      const formData = await prepareBlobFormData(gameData, currentUser._id);
      
      // Add game-specific fields
      formData.append('title', gameData.title);
      formData.append('developer', gameData.developer);
      formData.append('genre', gameData.genre);
      formData.append('platform', gameData.platform);
      formData.append('description', gameData.description);
      formData.append('releaseDate', gameData.releaseDate);
      
      if (gameData.platformLinks) {
        formData.append('platformLinks', JSON.stringify(gameData.platformLinks));
      }
      
      const response = await fetch('/API/games', {
        method: 'POST',
        body: formData,
        headers: {
          'x-user-id': currentUser._id
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating game with blob support:', error);
      throw error;
    }
  },
  
  update: async (id, gameData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      const formData = await prepareBlobFormData(gameData, currentUser._id);
      
      // Add game-specific fields
      formData.append('title', gameData.title);
      formData.append('developer', gameData.developer);
      formData.append('genre', gameData.genre);
      formData.append('platform', gameData.platform);
      formData.append('description', gameData.description);
      formData.append('releaseDate', gameData.releaseDate);
      
      if (gameData.platformLinks) {
        formData.append('platformLinks', JSON.stringify(gameData.platformLinks));
      }
      
      const response = await fetch(`/API/games/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'x-user-id': currentUser._id
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating game with blob support:', error);
      throw error;
    }
  }
};

// Image management utilities
export const imageManagement = {
  // Upload image to blob and get URL
  uploadImage: async (file, prefix = '') => {
    try {
      const filename = `${prefix}${Date.now()}-${file.name}`;
      const result = await uploadImageToBlob(file, filename);
      
      if (result.success) {
        return {
          success: true,
          url: result.url,
          filename: filename,
          type: 'blob'
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      return {
        success: false,
        error: error.message,
        type: 'traditional'
      };
    }
  },
  
  // Delete image from blob storage
  deleteImage: async (imageUrl) => {
    try {
      if (imageUrl && imageUrl.includes('vercel-storage.com')) {
        const result = await deleteImageFromBlob(imageUrl);
        return result;
      }
      return { success: true, message: 'Not a blob URL, no deletion needed' };
    } catch (error) {
      console.error('Image deletion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Get optimized image URL
  getImageUrl: (imagePath, options = {}) => {
    if (!imagePath) {
      return options.placeholder || 'https://via.placeholder.com/300x400/667eea/white?text=No+Image';
    }
    
    // If it's a blob URL, it's already optimized
    if (imagePath.includes('vercel-storage.com')) {
      return imagePath;
    }
    
    // If it's a full URL, use it directly
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a local path, use localhost
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:1412${imagePath}`;
    }
    
    // Default fallback
    return imagePath;
  }
};

export default {
  enhancedBooksAPI,
  enhancedGamesAPI,
  imageManagement
};