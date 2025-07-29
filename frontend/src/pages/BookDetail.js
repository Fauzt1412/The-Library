import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📚 Starting to fetch book details for ID:', id);
      
      const response = await booksAPI.getById(id);
      console.log('📚 Book detail response:', {
        status: response.status,
        dataType: typeof response.data,
        hasDataProperty: 'data' in response.data,
        dataValue: response.data
      });
      
      // Handle different response structures
      let bookData = null;
      if (response.data && response.data.data) {
        bookData = response.data.data;
      } else if (response.data && response.data._id) {
        bookData = response.data;
      } else {
        console.warn('📚 Unexpected book response structure:', response.data);
        throw new Error('Invalid response format');
      }
      
      console.log('📚 Setting book data:', {
        id: bookData._id,
        title: bookData.title,
        author: bookData.author
      });
      
      setBook(bookData);
      setError('');
    } catch (error) {
      console.error('📚 Error fetching book:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to load book details. ';
      if (error.response?.status === 404) {
        errorMessage = 'Book not found. It may have been removed or the link is incorrect.';
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
            <span className="visually-hidden">Loading book details...</span>
          </div>
          <p className="mt-3 text-muted">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center" role="alert">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>Error Loading Book</h4>
          <p>{error}</p>
          <button className="btn btn-primary me-2" onClick={fetchBook}>
            Try Again
          </button>
          <Link to="/books" className="btn btn-outline-primary">
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center" role="alert">
          <i className="fas fa-book fa-2x mb-3"></i>
          <h4>Book Not Found</h4>
          <p>The book you're looking for doesn't exist.</p>
          <Link to="/books" className="btn btn-primary">
            Back to Books
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
            <Link to="/books" className="text-decoration-none">Books</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {book.title}
          </li>
        </ol>
      </nav>

      <div className="row">
        {/* Book Image */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow">
            <img 
              src={getImageUrl(book.Coverpage, 'book')} 
              className="card-img-top" 
              alt={book.title}
              style={{ height: '500px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x600/667eea/white?text=Book+Cover';
              }}
            />
          </div>
        </div>

        {/* Book Details */}
        <div className="col-md-8">
          <div className="card border-0 shadow h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h1 className="card-title mb-0">{book.title}</h1>
                <FavoriteButton item={book} type="book" size="large" />
              </div>
              
              <div className="mb-3">
                <h5 className="text-muted">
                  <i className="fas fa-user me-2"></i>
                  by {book.author}
                </h5>
              </div>

              <div className="row mb-4">
                <div className="col-sm-6">
                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-tag me-2 text-primary"></i>
                      Category:
                    </strong>
                    <span className="badge bg-primary ms-2">{book.categories}</span>
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-2">
                    <strong>
                      <i className="fas fa-calendar me-2 text-primary"></i>
                      Published:
                    </strong>
                    {new Date(book.publishedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h5>
                  <i className="fas fa-align-left me-2 text-primary"></i>
                  Description
                </h5>
                <div className="text-muted" style={{ lineHeight: '1.6' }}>
                  {book.description ? (
                    <p>{book.description}</p>
                  ) : (
                    <p className="fst-italic">No description available for this book.</p>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div className="text-end">
                  {book.publishedBy && (
                    <div className="mb-1">
                      <small className="text-muted">
                        <i className="fas fa-user-edit me-1"></i>
                        Published by: {book.publishedBy.username || book.publishedBy.email}
                      </small>
                    </div>
                  )}
                  <small className="text-muted">Book ID: {book._id}</small>
                </div>
              </div>

              {/* Reading Links Section */}
              {book.readingLinks && Array.isArray(book.readingLinks) && book.readingLinks.length > 0 && (
                <div className="mb-4">
                  <h5>
                    <i className="fas fa-link me-2 text-primary"></i>
                    Reading Links
                  </h5>
                  <div className="row">
                    {book.readingLinks.map((link, index) => (
                      <div key={index} className="col-md-6 mb-2">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-between"
                        >
                          <span>
                            <i className={link.icon || 'fas fa-external-link-alt'} style={{ marginRight: '8px' }}></i>
                            {link.name}
                          </span>
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex gap-3 mb-4">
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: book.title,
                        text: `Check out "${book.title}" by ${book.author}`,
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
                <Link to="/books" className="btn btn-outline-primary">
                  <i className="fas fa-book me-2"></i>
                  Browse More Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Options Box */}
      <div className="row mt-5">
        <div className="col-12">
          <ReadButtonBox book={book} size="large" />
        </div>
      </div>

      {/* Additional Information */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Additional Information
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li><strong>Format:</strong> Paperback / Digital</li>
                    <li><strong>Language:</strong> English</li>
                    <li><strong>ISBN:</strong> Available upon request</li>
                    {book.createdAt && (
                      <li><strong>Added:</strong> {new Date(book.createdAt).toLocaleDateString()}</li>
                    )}
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li><strong>Shipping:</strong> Free shipping on orders over $25</li>
                    <li><strong>Return Policy:</strong> 30-day return policy</li>
                    <li><strong>Availability:</strong> In Stock</li>
                    {book.updatedAt && book.updatedAt !== book.createdAt && (
                      <li><strong>Last Updated:</strong> {new Date(book.updatedAt).toLocaleDateString()}</li>
                    )}
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

export default BookDetail;