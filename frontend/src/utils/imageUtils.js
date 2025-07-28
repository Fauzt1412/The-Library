// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return getPlaceholderImage('book');
  }
  
  // Determine base URL - prioritize local development detection
  let baseUrl;
  
  // If running on localhost, always use local server
  if (window.location.origin.includes('localhost')) {
    baseUrl = 'http://localhost:1412';
  } else {
    // If in production, use environment variable or fallback to production URL
    baseUrl = process.env.REACT_APP_API_URL || 'https://the-library-a11t.onrender.com';
  }
  
  // Debug logging
  console.log('🔍 Debug imageUtils:', {
    imagePath,
    envVar: process.env.REACT_APP_API_URL,
    windowOrigin: window.location.origin,
    isLocalhost: window.location.origin.includes('localhost'),
    finalBaseUrl: baseUrl
  });
  
  console.log('🎯 Final baseUrl:', baseUrl);
  

  
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