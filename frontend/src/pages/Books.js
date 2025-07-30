import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import { handleImageError, getLocalPlaceholder } from '../utils/placeholderUtils';
import { getImageUrl } from '../utils/imageUtils';
import '../styles/search-components.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📚 Starting to fetch books...');
      
      const response = await booksAPI.getAll();
      console.log('📚 Books response received:', {
        status: response.status,
        dataType: typeof response.data,
        hasDataProperty: 'data' in response.data,
        dataValue: response.data
      });
      
      // Handle different response structures
      let booksData = [];
      if (response.data && Array.isArray(response.data.data)) {
        booksData = response.data.data;
      } else if (Array.isArray(response.data)) {
        booksData = response.data;
      } else {
        console.warn('📚 Unexpected response structure:', response.data);
        booksData = [];
      }
      
      console.log('📚 Setting books data:', { count: booksData.length });
      

      
      setBooks(booksData);
      setError('');
    } catch (error) {
      console.error('📚 Error fetching books:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to load books. ';
      if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to server. Please check if the server is running.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }
      
      setError(errorMessage);
      setBooks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Ensure books is an array before filtering
  const safeBooks = Array.isArray(books) ? books : [];
  
  const filteredBooks = safeBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || book.categories.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(safeBooks.map(book => book.categories))];

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading books...</span>
          </div>
          <p className="mt-3 text-muted">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">Our Book Collection</h1>
          <p className="section-subtitle">Discover your next favorite read</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-outline-danger ms-3" 
            onClick={fetchBooks}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-filter-title">
          <i className="fas fa-search"></i>
          Search & Filter Books
        </div>
        <div className="row">
          <div className="col-md-8 mb-3 mb-md-0">
            <div className="search-input-group">
              <span className="search-input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search books by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="search-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <>
          <div className="search-results-info">
            <i className="fas fa-info-circle"></i>
            Showing {filteredBooks.length} of {safeBooks.length} books
          </div>
          <div className="row">
            {filteredBooks.map((book) => (
              <div key={book._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div className="card h-100">
                  <img 
                    src={getImageUrl(book.Coverpage, 'book')} 
                    className="card-img-top" 
                    alt={book.title}
                    onError={(e) => handleImageError(e, 'book')}
                  />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{book.title}</h5>
                      <FavoriteButton item={book} type="book" size="small" />
                    </div>
                    <p className="card-text text-muted">
                      <i className="fas fa-user me-1"></i>
                      {book.author}
                    </p>
                    <p className="card-text">
                      <small className="text-muted">
                        <i className="fas fa-tag me-1"></i>
                        {book.categories}
                      </small>
                    </p>
                    <p className="card-text flex-grow-1">
                      {book.description?.substring(0, 100)}
                      {book.description?.length > 100 && '...'}
                    </p>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-end align-items-center mt-auto">
                        <Link to={`/books/${book._id}`} className="btn btn-primary">
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
        <div className="no-results-container">
          <div className="no-results-icon">
            <i className="fas fa-search"></i>
          </div>
          <h4 className="no-results-title">No books found</h4>
          <p className="no-results-text">
            {searchTerm || categoryFilter 
              ? 'Try adjusting your search criteria to find more books' 
              : 'No books are available at the moment'
            }
          </p>
          {(searchTerm || categoryFilter) && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
              }}
            >
              <i className="fas fa-times"></i>
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Books;