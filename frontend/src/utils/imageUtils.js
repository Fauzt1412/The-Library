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

// Local placeholder images using data URLs to avoid external dependencies
const createPlaceholderDataUrl = (width, height, text, bgColor = '#6c757d', textColor = '#ffffff') => {
  // Create a simple SVG data URL instead of canvas for better compatibility
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 15}" 
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Utility function to get placeholder image
export const getPlaceholderImage = (type = 'book') => {
  const placeholders = {
    book: createPlaceholderDataUrl(300, 400, 'Book Cover', '#667eea'),
    game: createPlaceholderDataUrl(300, 400, 'Game Cover', '#764ba2'),
    bookDetail: createPlaceholderDataUrl(400, 600, 'Book Cover', '#667eea'),
    gameDetail: createPlaceholderDataUrl(400, 600, 'Game Cover', '#764ba2'),
    noImage: createPlaceholderDataUrl(300, 200, 'No Image', '#6c757d')
  };
  
  return placeholders[type] || placeholders.book;
};

// Safe image error handler to prevent infinite loops
export const handleImageError = (e, fallbackType = 'book') => {
  // Prevent infinite error loops
  if (e.target.dataset.errorHandled) {
    return;
  }
  
  e.target.dataset.errorHandled = 'true';
  e.target.src = getPlaceholderImage(fallbackType);
};