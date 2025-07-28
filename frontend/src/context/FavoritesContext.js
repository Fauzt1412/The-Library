import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { favoritesAPI } from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  // Always call useAuth hook at the top level
  const authContext = useAuth();
  
  // Safely extract values with fallbacks
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use useCallback to memoize loadFavorites function
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !user || !user._id) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('❤️ Loading favorites from backend for user:', user._id);
      
      const response = await favoritesAPI.getUserFavorites();
      
      // Handle different response structures
      let favoritesData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        favoritesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        favoritesData = response.data;
      } else {
        console.warn('⚠️ Unexpected favorites response structure:', response.data);
        favoritesData = [];
      }
      
      console.log('✅ Loaded', favoritesData.length, 'favorites');
      setFavorites(favoritesData);
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
      setError('Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load favorites from backend when user is authenticated
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addToFavorites = async (item, type) => {
    if (!isAuthenticated || !user) {
      setError('Please log in to add favorites');
      return false;
    }

    try {
      console.log('❤️ Adding to favorites:', item.title || item.name, type);
      const response = await favoritesAPI.addToFavorites(item._id, type);
      
      // Handle response structure
      const responseData = response.data || response;
      if (responseData.success) {
        // Add to local state
        const favoriteItem = responseData.favorite;
        setFavorites(prevFavorites => {
          // Ensure prevFavorites is an array
          const safeFavorites = Array.isArray(prevFavorites) ? prevFavorites : [];
          const exists = safeFavorites.some(fav => fav.id === item._id && fav.type === type);
          if (exists) {
            return safeFavorites;
          }
          return [...safeFavorites, favoriteItem];
        });
        
        console.log('✅ Added to favorites successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      setError(error.message || 'Failed to add to favorites');
      return false;
    }
  };

  const removeFromFavorites = async (itemId, type) => {
    if (!isAuthenticated || !user) {
      setError('Please log in to manage favorites');
      return false;
    }

    try {
      console.log('💔 Removing from favorites:', itemId, type);
      const response = await favoritesAPI.removeFromFavorites(itemId, type);
      
      // Handle response structure
      const responseData = response.data || response;
      if (responseData.success) {
        // Remove from local state
        setFavorites(prevFavorites => {
          // Ensure prevFavorites is an array
          const safeFavorites = Array.isArray(prevFavorites) ? prevFavorites : [];
          return safeFavorites.filter(fav => !(fav.id === itemId && fav.type === type));
        });
        
        console.log('✅ Removed from favorites successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      setError(error.message || 'Failed to remove from favorites');
      return false;
    }
  };

  const isFavorite = (itemId, type) => {
    // Ensure favorites is always an array before using .some()
    if (!Array.isArray(favorites)) {
      console.warn('⚠️ Favorites is not an array:', favorites);
      return false;
    }
    return favorites.some(fav => fav.id === itemId && fav.type === type);
  };

  const toggleFavorite = async (item, type) => {
    if (!isAuthenticated || !user) {
      setError('Please log in to manage favorites');
      return false;
    }

    try {
      console.log('🔄 Toggling favorite:', item.title || item.name, type);
      const response = await favoritesAPI.toggleFavorite(item._id, type);
      
      // Handle response structure
      const responseData = response.data || response;
      if (responseData.success) {
        if (responseData.isFavorite) {
          // Added to favorites
          const favoriteItem = responseData.favorite;
          setFavorites(prevFavorites => {
            // Ensure prevFavorites is an array
            const safeFavorites = Array.isArray(prevFavorites) ? prevFavorites : [];
            const exists = safeFavorites.some(fav => fav.id === item._id && fav.type === type);
            if (exists) {
              return safeFavorites;
            }
            return [...safeFavorites, favoriteItem];
          });
        } else {
          // Removed from favorites
          setFavorites(prevFavorites => {
            // Ensure prevFavorites is an array
            const safeFavorites = Array.isArray(prevFavorites) ? prevFavorites : [];
            return safeFavorites.filter(fav => !(fav.id === item._id && fav.type === type));
          });
        }
        
        console.log('✅ Toggled favorite successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      setError(error.message || 'Failed to toggle favorite');
      return false;
    }
  };

  const getFavoritesByType = (type) => {
    // Ensure favorites is always an array before using .filter()
    if (!Array.isArray(favorites)) {
      console.warn('⚠️ Favorites is not an array:', favorites);
      return [];
    }
    return favorites.filter(fav => fav.type === type);
  };

  const clearAllFavorites = async () => {
    if (!isAuthenticated || !user) {
      setError('Please log in to manage favorites');
      return false;
    }

    try {
      console.log('🗑️ Clearing all favorites...');
      const response = await favoritesAPI.clearAllFavorites();
      
      // Handle response structure
      const responseData = response.data || response;
      if (responseData.success) {
        setFavorites([]);
        console.log('✅ Cleared all favorites successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Error clearing favorites:', error);
      setError(error.message || 'Failed to clear favorites');
      return false;
    }
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getFavoritesByType,
    clearAllFavorites,
    loadFavorites,
    favoritesCount: Array.isArray(favorites) ? favorites.length : 0,
    loading,
    error,
    isAuthenticated
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;