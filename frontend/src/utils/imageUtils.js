// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('🖼️ getImageUrl: No image path provided');
    return null;
  }
  
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:1412';
  
  // Debug logging
  console.log('🖼️ getImageUrl:', {
    imagePath,
    baseUrl,
    startsWithHttp: imagePath.startsWith('http'),
    startsWithSlash: imagePath.startsWith('/')
  });
  
  // If the imagePath already includes the full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('🖼️ Returning full URL:', imagePath);
    return imagePath;
  }
  
  // If the imagePath starts with '/', prepend the base URL
  if (imagePath.startsWith('/')) {
    const fullUrl = `${baseUrl}${imagePath}`;
    console.log('🖼️ Returning constructed URL:', fullUrl);
    return fullUrl;
  }
  
  // Otherwise, assume it's a relative path and prepend base URL with '/'
  const fullUrl = `${baseUrl}/${imagePath}`;
  console.log('🖼️ Returning relative URL:', fullUrl);
  return fullUrl;
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