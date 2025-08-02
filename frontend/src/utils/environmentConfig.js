// Environment configuration utility
export const getEnvironmentConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production' || 
    (typeof window !== 'undefined' && 
     window.location.hostname !== 'localhost' && 
     window.location.hostname !== '127.0.0.1');

  const config = {
    isProduction,
    apiUrl: isProduction 
      ? (process.env.REACT_APP_API_URL || 'https://the-library-a11t.onrender.com')
      : (process.env.REACT_APP_API_URL || 'http://localhost:1412'),
    frontendUrl: isProduction
      ? 'https://the-library-seven.vercel.app'
      : 'http://localhost:3000'
  };

  console.log('🌍 Environment Config:', config);
  return config;
};

export const getApiUrl = () => {
  return getEnvironmentConfig().apiUrl;
};

export const isProductionEnvironment = () => {
  return getEnvironmentConfig().isProduction;
};