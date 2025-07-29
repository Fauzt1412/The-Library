// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return getPlaceholderImage('book');
  }
  
  // Simple, reliable approach - use localhost for development
  const baseUrl = 'http://localhost:1412';
  
  // If the imagePath already includes the full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If the imagePath starts with '/', prepend the base URL
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend base URL with '/'
  return `${baseUrl}/${imagePath}`;
};

import { getLocalPlaceholder } from './placeholderUtils';

// Utility function to get placeholder image (now using local placeholders)
export const getPlaceholderImage = (type = 'book') => {
  return getLocalPlaceholder(type);
};