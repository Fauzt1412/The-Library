import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const { favorites, getFavoritesByType, removeFromFavorites, clearAllFavorites, loading, error } = useFavorites();
  const [activeFilter, setActiveFilter] = useState('all');

  const favoriteBooks = getFavoritesByType('book');
  const favoriteGames = getFavoritesByType('game');

  const getFilteredFavorites = () => {
    switch (activeFilter) {
      case 'books':
        return favoriteBooks;
      case 'games':
        return favoriteGames;
      default:
        return favorites;
    }
  };

  const filteredFavorites = getFilteredFavorites();

  const handleRemoveFavorite = async (itemId, type) => {
    if (window.confirm('Remove this item from favorites?')) {
      await removeFromFavorites(itemId, type);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      await clearAllFavorites();
    }
  };

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow">
              <div className="card-body py-5">
                <i className="fas fa-heart fa-3x text-muted mb-3"></i>
                <h3>Login Required</h3>
                <p className="text-muted mb-4">
                  Please log in to view and manage your favorites. Your favorites are saved to your account and will be available across all your devices.
                </p>
                <Link to="/login" className="btn btn-primary me-2">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-outline-primary">
                  <i className="fas fa-user-plus me-2"></i>
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">
            <i className="fas fa-heart me-2"></i>
            My Favorites
          </h1>
          <p className="section-subtitle">
            Your collection of favorite books and games
          </p>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => window.location.reload()}></button>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading favorites...</span>
          </div>
          <p className="mt-2 text-muted">Loading your favorites...</p>
        </div>
      )}

      {/* Stats and Actions */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex gap-3 align-items-center">
            <div className="badge bg-primary fs-6">
              {favorites.length} Total
            </div>
            <div className="badge bg-info fs-6">
              {favoriteBooks.length} Books
            </div>
            <div className="badge bg-success fs-6">
              {favoriteGames.length} Games
            </div>
          </div>
        </div>
        <div className="col-md-4 text-end">
          {favorites.length > 0 && (
            <button 
              className="btn btn-outline-danger"
              onClick={handleClearAll}
            >
              <i className="fas fa-trash me-1"></i>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card border-0 shadow mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <i className="fas fa-list me-2"></i>
                All ({favorites.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeFilter === 'books' ? 'active' : ''}`}
                onClick={() => setActiveFilter('books')}
              >
                <i className="fas fa-book me-2"></i>
                Books ({favoriteBooks.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeFilter === 'games' ? 'active' : ''}`}
                onClick={() => setActiveFilter('games')}
              >
                <i className="fas fa-gamepad me-2"></i>
                Games ({favoriteGames.length})
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {filteredFavorites.length > 0 ? (
            <div className="row">
              {filteredFavorites.map((favorite) => (
                <div key={`${favorite.type}-${favorite.id}`} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <div className="card h-100">
                    <div className="position-relative">
                      <img 
                        src={
                          favorite.type === 'book' 
                            ? (favorite.data.Coverpage ? `http://localhost:1412${favorite.data.Coverpage}` : 'https://via.placeholder.com/300x400/667eea/white?text=Book+Cover')
                            : (favorite.data.coverImage ? `http://localhost:1412${favorite.data.coverImage}` : 'https://via.placeholder.com/300x400/764ba2/white?text=Game+Cover')
                        }
                        className="card-img-top" 
                        alt={favorite.data.title}
                        style={{ height: '250px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = favorite.type === 'book' 
                            ? 'https://via.placeholder.com/300x400/667eea/white?text=Book+Cover'
                            : 'https://via.placeholder.com/300x400/764ba2/white?text=Game+Cover';
                        }}
                      />
                      <div className="position-absolute top-0 end-0 p-2">
                        <button
                          className="favorite-btn favorited"
                          onClick={() => handleRemoveFavorite(favorite.id, favorite.type)}
                          title="Remove from favorites"
                        >
                          <i className="fas fa-heart"></i>
                        </button>
                      </div>
                      <div className="position-absolute top-0 start-0 p-2">
                        <span className={`badge ${favorite.type === 'book' ? 'bg-primary' : 'bg-success'}`}>
                          <i className={`fas ${favorite.type === 'book' ? 'fa-book' : 'fa-gamepad'} me-1`}></i>
                          {favorite.type === 'book' ? 'Book' : 'Game'}
                        </span>
                      </div>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{favorite.data.title}</h5>
                      <p className="card-text text-muted">
                        <i className={`fas ${favorite.type === 'book' ? 'fa-user' : 'fa-code'} me-1`}></i>
                        {favorite.type === 'book' ? favorite.data.author : favorite.data.developer}
                      </p>
                      
                      {favorite.type === 'book' && (
                        <p className="card-text">
                          <small className="text-muted">
                            <i className="fas fa-tag me-1"></i>
                            {favorite.data.categories}
                          </small>
                        </p>
                      )}
                      
                      {favorite.type === 'game' && (
                        <div className="mb-2">
                          <span className="badge bg-primary me-1">
                            <i className="fas fa-gamepad me-1"></i>
                            {favorite.data.genre}
                          </span>
                          <span className="badge bg-secondary">
                            <i className="fas fa-desktop me-1"></i>
                            {favorite.data.platform}
                          </span>
                        </div>
                      )}
                      
                      <p className="card-text flex-grow-1">
                        {favorite.data.description?.substring(0, 100)}
                        {favorite.data.description?.length > 100 && '...'}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="d-flex justify-content-end align-items-center">
                          <Link 
                            to={`/${favorite.type === 'book' ? 'books' : 'games'}/${favorite.id}`} 
                            className="btn btn-primary btn-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-heart fa-3x text-muted mb-3"></i>
              <h4>No favorites yet</h4>
              <p className="text-muted">
                {activeFilter === 'all' 
                  ? 'Start adding books and games to your favorites!'
                  : `No ${activeFilter} in your favorites yet.`
                }
              </p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Link to="/books" className="btn btn-primary">
                  <i className="fas fa-book me-1"></i>
                  Browse Books
                </Link>
                <Link to="/games" className="btn btn-success">
                  <i className="fas fa-gamepad me-1"></i>
                  Browse Games
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {favorites.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-chart-bar me-2"></i>
                  Favorites Summary
                </h5>
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border-end">
                      <h3 className="text-primary">{favorites.length}</h3>
                      <p className="text-muted mb-0">Total Items</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h3 className="text-info">{favoriteBooks.length}</h3>
                      <p className="text-muted mb-0">Books</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h3 className="text-success">{favoriteGames.length}</h3>
                      <p className="text-muted mb-0">Games</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;