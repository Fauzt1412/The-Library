import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gamesAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import { handleImageError, getPlaceholderImage } from '../utils/imageUtils';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🎮 Starting to fetch games...');
      
      const response = await gamesAPI.getAll();
      console.log('🎮 Games response received:', {
        status: response.status,
        dataType: typeof response.data,
        hasDataProperty: 'data' in response.data,
        dataValue: response.data
      });
      
      // Handle different response structures
      let gamesData = [];
      if (response.data && Array.isArray(response.data.data)) {
        gamesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        gamesData = response.data;
      } else {
        console.warn('🎮 Unexpected response structure:', response.data);
        gamesData = [];
      }
      
      console.log('🎮 Setting games data:', { count: gamesData.length });
      setGames(gamesData);
      setError('');
    } catch (error) {
      console.error('🎮 Error fetching games:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to load games. ';
      if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to server. Please check if the server is running.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }
      
      setError(errorMessage);
      setGames([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Ensure games is an array before filtering
  const safeGames = Array.isArray(games) ? games : [];
  
  const filteredGames = safeGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !genreFilter || game.genre.toLowerCase().includes(genreFilter.toLowerCase());
    const matchesPlatform = !platformFilter || game.platform.toLowerCase().includes(platformFilter.toLowerCase());
    return matchesSearch && matchesGenre && matchesPlatform;
  });

  const genres = [...new Set(safeGames.map(game => game.genre))];
  const platforms = [...new Set(safeGames.map(game => game.platform))];

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading games...</span>
          </div>
          <p className="mt-3 text-muted">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">Our Game Collection</h1>
          <p className="section-subtitle">Find your next gaming adventure</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-outline-danger ms-3" 
            onClick={fetchGames}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search games by title or developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((genre, index) => (
              <option key={index} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="">All Platforms</option>
            {platforms.map((platform, index) => (
              <option key={index} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <>
          <div className="row mb-3">
            <div className="col-12">
              <p className="text-muted">
                Showing {filteredGames.length} of {safeGames.length} games
              </p>
            </div>
          </div>
          <div className="row">
            {filteredGames.map((game) => (
              <div key={game._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div className="card h-100">
                  <img 
                    src={game.coverImage ? `http://localhost:1412${game.coverImage}` : getPlaceholderImage('game')} 
                    className="card-img-top" 
                    alt={game.title}
                    onError={(e) => handleImageError(e, 'game')}
                  />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{game.title}</h5>
                      <FavoriteButton item={game} type="game" size="small" />
                    </div>
                    <p className="card-text text-muted">
                      <i className="fas fa-code me-1"></i>
                      {game.developer}
                    </p>
                    <div className="mb-2">
                      <span className="badge bg-primary me-1">
                        <i className="fas fa-gamepad me-1"></i>
                        {game.genre}
                      </span>
                      <span className="badge bg-secondary">
                        <i className="fas fa-desktop me-1"></i>
                        {game.platform}
                      </span>
                    </div>
                    <p className="card-text flex-grow-1">
                      {game.description?.substring(0, 100)}
                      {game.description?.length > 100 && '...'}
                    </p>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-end align-items-center mt-auto">
                        <Link to={`/games/${game._id}`} className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-search fa-3x text-muted mb-3"></i>
          <h4>No games found</h4>
          <p className="text-muted">
            {searchTerm || genreFilter || platformFilter 
              ? 'Try adjusting your search criteria' 
              : 'No games are available at the moment'
            }
          </p>
          {(searchTerm || genreFilter || platformFilter) && (
            <button 
              className="btn btn-outline-primary"
              onClick={() => {
                setSearchTerm('');
                setGenreFilter('');
                setPlatformFilter('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Games;