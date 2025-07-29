import { getLocalPlaceholder } from './placeholderUtils';

// Utility function to get the correct image URL
export const getImageUrl = (imagePath, placeholderType = 'book') => {
  if (!imagePath) {
    return getPlaceholderImage(placeholderType);
  }
  
  // If the imagePath already includes the full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // For local paths, use localhost for development
  const baseUrl = 'http://localhost:1412';
  
  // If the imagePath starts with '/', prepend the base URL
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend base URL with '/'
  return `${baseUrl}/${imagePath}`;
};

// Utility function to get placeholder image (now using local placeholders)
export const getPlaceholderImage = (type = 'book') => {
  return getLocalPlaceholder(type);
};