// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return getPlaceholderImage('book');
  }
  
  // Get base URL with fallback logic
  let baseUrl = process.env.REACT_APP_API_URL;
  
  // If environment variable is not set or is placeholder, determine based on current location
  if (!baseUrl || baseUrl.includes('your-backend-name')) {
    if (window.location.origin.includes('localhost')) {
      baseUrl = 'http://localhost:1412';
    } else {
      baseUrl = 'https://the-library-a11t.onrender.com';
    }
  }
  

  
  // If the imagePath already includes the full URL (Cloudinary, etc.), return as is
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

// Utility function to get placeholder image
export const getPlaceholderImage = (type = 'book') => {
  const placeholders = {
    book: 'https://via.placeholder.com/300x400/667eea/white?text=Book+Cover',
    game: 'https://via.placeholder.com/300x400/764ba2/white?text=Game+Cover',
    bookDetail: 'https://via.placeholder.com/400x600/667eea/white?text=Book+Cover',
    gameDetail: 'https://via.placeholder.com/400x600/764ba2/white?text=Game+Cover'
  };
  
  return placeholders[type] || placeholders.book;
};