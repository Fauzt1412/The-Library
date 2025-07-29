// Local placeholder image utilities - no external dependencies

// Generate SVG-based placeholder data URL
const createPlaceholderSVG = (width, height, text, bgColor = '#6c757d', textColor = '#ffffff') => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 15}" 
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Predefined placeholder images
export const PLACEHOLDER_IMAGES = {
  book: createPlaceholderSVG(300, 400, 'Book Cover', '#667eea'),
  game: createPlaceholderSVG(300, 400, 'Game Cover', '#764ba2'),
  bookDetail: createPlaceholderSVG(400, 600, 'Book Cover', '#667eea'),
  gameDetail: createPlaceholderSVG(400, 600, 'Game Cover', '#764ba2'),
  noImage: createPlaceholderSVG(300, 200, 'No Image', '#6c757d'),
  general: createPlaceholderSVG(300, 300, 'Image', '#6c757d')
};

// Get placeholder image by type
export const getLocalPlaceholder = (type = 'general') => {
  return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.general;
};

// Safe image error handler
export const handleImageError = (e, placeholderType = 'general') => {
  // Prevent infinite error loops
  if (e.target.dataset.errorHandled) {
    return;
  }
  
  e.target.dataset.errorHandled = 'true';
  e.target.src = getLocalPlaceholder(placeholderType);
};

// Get image source with fallback
export const getImageSrc = (imagePath, placeholderType = 'general') => {
  if (!imagePath) {
    return getLocalPlaceholder(placeholderType);
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
};

export default {
  PLACEHOLDER_IMAGES,
  getLocalPlaceholder,
  handleImageError,
  getImageSrc,
  createPlaceholderSVG
};