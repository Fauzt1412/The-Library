import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, gamesAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        console.log('🏠 Starting to fetch featured items...');
        
        const [booksResponse, gamesResponse] = await Promise.all([
          booksAPI.getAll(),
          gamesAPI.getAll()
        ]);
        
        console.log('🏠 Featured items responses:', {
          books: {
            status: booksResponse.status,
            dataType: typeof booksResponse.data,
            hasDataProperty: 'data' in booksResponse.data,
            dataValue: booksResponse.data
          },
          games: {
            status: gamesResponse.status,
            dataType: typeof gamesResponse.data,
            hasDataProperty: 'data' in gamesResponse.data,
            dataValue: gamesResponse.data
          }
        });
        
        // Handle different response structures for books
        let booksData = [];
        if (booksResponse.data && Array.isArray(booksResponse.data.data)) {
          booksData = booksResponse.data.data;
        } else if (Array.isArray(booksResponse.data)) {
          booksData = booksResponse.data;
        } else {
          console.warn('🏠 Unexpected books response structure:', booksResponse.data);
          booksData = [];
        }
        
        // Handle different response structures for games
        let gamesData = [];
        if (gamesResponse.data && Array.isArray(gamesResponse.data.data)) {
          gamesData = gamesResponse.data.data;
        } else if (Array.isArray(gamesResponse.data)) {
          gamesData = gamesResponse.data;
        } else {
          console.warn('🏠 Unexpected games response structure:', gamesResponse.data);
          gamesData = [];
        }
        
        console.log('🏠 Setting featured items:', {
          booksCount: booksData.length,
          gamesCount: gamesData.length,
          featuredBooks: booksData.slice(0, 3).length,
          featuredGames: gamesData.slice(0, 3).length
        });
        
        setFeaturedBooks(booksData.slice(0, 3));
        setFeaturedGames(gamesData.slice(0, 3));
      } catch (error) {
        console.error('🏠 Error fetching featured items:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        // Set empty arrays on error
        setFeaturedBooks([]);
        setFeaturedGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading featured content...</span>
          </div>
          <p className="mt-3 text-muted">Loading featured books and games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Welcome to The Library</h1>
          <p className="hero-subtitle">
            Your comprehensive wiki and information space for books and games
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/books" className="btn btn-light btn-lg">
              <i className="fas fa-book me-2"></i>
              Browse Books
            </Link>
            <Link to="/games" className="btn btn-outline-light btn-lg">
              <i className="fas fa-gamepad me-2"></i>
              Explore Games
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="section-title">Featured Books</h2>
          <p className="section-subtitle">Discover our handpicked selection of amazing books</p>
          
          {featuredBooks.length > 0 ? (
            <div className="row">
              {featuredBooks.map((book) => (
                <div key={book._id} className="col-md-4 mb-4">
                  <div className="card h-100">
                    <img 
                      src={book.Coverpage ? `http://localhost:1412${book.Coverpage}` : 'https://via.placeholder.com/300x400/667eea/white?text=Book+Cover'} 
                      className="card-img-top" 
                      alt={book.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400/667eea/white?text=Book+Cover';
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{book.title}</h5>
                        <FavoriteButton item={book} type="book" size="small" />
                      </div>
                      <p className="card-text text-muted">by {book.author}</p>
                      <p className="card-text flex-grow-1">
                        {book.description?.substring(0, 100)}...
                      </p>
                      <div className="d-flex justify-content-end align-items-center mt-auto">
                        <Link to={`/books/${book._id}`} className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p>No featured books available at the moment.</p>
              <Link to="/books" className="btn btn-primary">View All Books</Link>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/books" className="btn btn-outline-primary">
              View All Books <i className="fas fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="section-title">Featured Games</h2>
          <p className="section-subtitle">Check out the latest and greatest games</p>
          
          {featuredGames.length > 0 ? (
            <div className="row">
              {featuredGames.map((game) => (
                <div key={game._id} className="col-md-4 mb-4">
                  <div className="card h-100">
                    <img 
                      src={game.coverImage ? `http://localhost:1412${game.coverImage}` : 'https://via.placeholder.com/300x400/764ba2/white?text=Game+Cover'} 
                      className="card-img-top" 
                      alt={game.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x400/764ba2/white?text=Game+Cover';
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{game.title}</h5>
                        <FavoriteButton item={game} type="game" size="small" />
                      </div>
                      <p className="card-text text-muted">
                        <i className="fas fa-gamepad me-1"></i>
                        {game.genre} | {game.platform}
                      </p>
                      <p className="card-text flex-grow-1">
                        {game.description?.substring(0, 100)}...
                      </p>
                      <div className="d-flex justify-content-end align-items-center mt-auto">
                        <Link to={`/games/${game._id}`} className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p>No featured games available at the moment.</p>
              <Link to="/games" className="btn btn-primary">View All Games</Link>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/games" className="btn btn-outline-primary">
              View All Games <i className="fas fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="row">
            <div className="col-md-4 text-center mb-4">
              <div className="card border-0 h-100">
                <div className="card-body">
                  <i className="fas fa-shipping-fast fa-3x text-primary mb-3"></i>
                  <h5>Fast Delivery</h5>
                  <p className="card-text">Get your books and games delivered quickly to your doorstep.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div className="card border-0 h-100">
                <div className="card-body">
                  <i className="fas fa-star fa-3x text-warning mb-3"></i>
                  <h5>Quality Products</h5>
                  <p className="card-text">We offer only the best books and games from trusted publishers.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div className="card border-0 h-100">
                <div className="card-body">
                  <i className="fas fa-headset fa-3x text-success mb-3"></i>
                  <h5>24/7 Support</h5>
                  <p className="card-text">Our customer support team is always ready to help you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;