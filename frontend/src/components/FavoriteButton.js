import React, { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';

const FavoriteButton = ({ item, type, className = '', size = 'normal' }) => {
  const { isFavorite, toggleFavorite, isAuthenticated, error } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  const isItemFavorite = isFavorite(item._id, type);

  const iconSize = {
    small: 'fa-sm',
    normal: '',
    large: 'fa-lg'
  }[size];

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please log in to add favorites');
      return;
    }
    
    setIsLoading(true);
    try {
      await toggleFavorite(item, type);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClass = size === 'small' ? 'btn-sm' : size === 'large' ? 'btn-lg' : '';

  return (
    <button
      className={`favorite-btn ${isItemFavorite ? 'favorited' : ''} ${className} ${sizeClass}`}
      onClick={handleClick}
      title={isAuthenticated ? (isItemFavorite ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
      aria-label={isAuthenticated ? (isItemFavorite ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
      disabled={isLoading}
    >
      {isLoading ? (
        <i className={`fas fa-spinner fa-spin ${iconSize}`}></i>
      ) : (
        <i className={`${isItemFavorite ? 'fas' : 'far'} fa-heart ${iconSize}`}></i>
      )}
    </button>
  );
};

export default FavoriteButton;