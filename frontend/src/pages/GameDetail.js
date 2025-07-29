import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gamesAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import PlayButton from '../components/PlayButton';
import PlayButtonBox from '../components/PlayButtonBox';
import { handleImageError, getPlaceholderImage } from '../utils/imageUtils';

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGame();
  }, [id]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🎮 Starting to fetch game details for ID:', id);
      
      const response = await gamesAPI.getById(id);
      console.log('🎮 Game detail response:', {
        status: response.status,
        dataType: typeof response.data,
        hasDataProperty: 'data' in response.data,
        dataValue: response.data
      });
      
      // Handle different response structures
      let gameData = null;
      if (response.data && response.data.data) {
        gameData = response.data.data;
      } else if (response.data && response.data._id) {
        gameData = response.data;
      } else {
        console.warn('🎮 Unexpected game response structure:', response.data);
        throw new Error('Invalid response format');
      }
      
      console.log('🎮 Setting game data:', {
        id: gameData._id,
        title: gameData.title,
        developer: gameData.developer
      });
      
      setGame(gameData);
      setError('');
    } catch (error) {
      console.error('🎮 Error fetching game:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to load game details. ';
      if (error.response?.status === 404) {
        errorMessage = 'Game not found. It may have been removed or the link is incorrect.';
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to server. Please check if the server is running.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading game details...</span>
          </div>
          <p className="mt-3 text-muted">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center" role="alert">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>Error Loading Game</h4>
          <p>{error}</p>
          <button className="btn btn-primary me-2" onClick={fetchGame}>
            Try Again
          </button>
          <Link to="/games" className="btn btn-outline-primary">
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center" role="alert">
          <i className="fas fa-gamepad fa-2x mb-3"></i>
          <h4>Game Not Found</h4>
          <p>The game you're looking for doesn't exist.</p>
          <Link to="/games" className="btn btn-primary">
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/games" className="text-decoration-none">Games</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {game.title}
          </li>
        </ol>
      </nav>

      <div className="row">
        {/* Game Image */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow">
            <img 
              src={game.coverImage ? `http://localhost:1412${game.coverImage}` : getPlaceholderImage('gameDetail')} 
              className="card-img-top" 
              alt={game.title}
              style={{ height: '500px', objectFit: 'cover' }}
              onError={(e) => handleImageError(e, 'gameDetail')}
            />
          </div>
        </div>

        {/* Game Details */}
        <div className="col-md-8">
          <div className="card border-0 shadow h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h1 className="card-title mb-0">{game.title}</h1>
                <FavoriteButton item={game} type="game" size="large" />
              </div>
              
              <div className="mb-3">
                <h5 className="text-muted">
                  <i className="fas fa-code me-2"></i>
                  by {game.developer}
                </h5>
              </div>

              <div className="row mb-4">
                <div className="col-sm-6">
                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-gamepad me-2 text-primary"></i>
                      Genre:
                    </strong>
                    <span className="badge bg-primary ms-2">{game.genre}</span>
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-desktop me-2 text-primary"></i>
                      Platform:
                    </strong>
                    <span className="badge bg-secondary ms-2">{game.platform}</span>
                  </p>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-sm-6">
                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-calendar me-2 text-primary"></i>
                      Release Date:
                    </strong>
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-building me-2 text-primary"></i>
                      Developer:
                    </strong>
                    {game.developer}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h5>
                  <i className="fas fa-align-left me-2 text-primary"></i>
                  Description
                </h5>
                <p className="text-muted" style={{ lineHeight: '1.6' }}>
                  {game.description || 'No description available for this game.'}
                </p>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div className="text-end">
                  <small className="text-muted">Game ID: {game._id}</small>
                </div>
              </div>

              <div className="d-flex gap-3 mb-4">
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: game.title,
                        text: `Check out "${game.title}" by ${game.developer}`,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                >
                  <i className="fas fa-share me-2"></i>
                  Share
                </button>
              </div>

              <hr className="my-4" />

              <div className="d-flex justify-content-between">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate(-1)}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Go Back
                </button>
                <Link to="/games" className="btn btn-outline-primary">
                  <i className="fas fa-gamepad me-2"></i>
                  Browse More Games
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gaming Platforms Box */}
      <div className="row mt-5">
        <div className="col-12">
          <PlayButtonBox game={game} size="large" />
        </div>
      </div>

      {/* System Requirements */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-cogs me-2 text-primary"></i>
                System Requirements & Information
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary">Minimum Requirements:</h6>
                  <ul className="list-unstyled">
                    <li><strong>OS:</strong> Windows 10 / macOS 10.15 / Ubuntu 18.04</li>
                    <li><strong>Processor:</strong> Intel i5 / AMD Ryzen 5</li>
                    <li><strong>Memory:</strong> 8 GB RAM</li>
                    <li><strong>Graphics:</strong> DirectX 11 compatible</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary">Additional Info:</h6>
                  <ul className="list-unstyled">
                    <li><strong>File Size:</strong> ~15 GB</li>
                    <li><strong>Languages:</strong> English, Spanish, French</li>
                    <li><strong>Multiplayer:</strong> Online & Local</li>
                    <li><strong>DRM:</strong> Steam, Epic Games Store</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-star me-2 text-primary"></i>
                Game Features
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li><i className="fas fa-check text-success me-2"></i>Single Player Campaign</li>
                    <li><i className="fas fa-check text-success me-2"></i>Multiplayer Mode</li>
                    <li><i className="fas fa-check text-success me-2"></i>Achievements</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li><i className="fas fa-check text-success me-2"></i>Cloud Saves</li>
                    <li><i className="fas fa-check text-success me-2"></i>Controller Support</li>
                    <li><i className="fas fa-check text-success me-2"></i>Regular Updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;