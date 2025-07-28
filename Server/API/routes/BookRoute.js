const Router = require('express').Router;
const BookRoute = Router();
const { authenticateUser, canPublish, requireAdmin } = require('../middleware/auth');
const { uploadBookCover, handleUploadError } = require('../middleware/upload');

const { GetAllBooks, GetBookById, CreateBook, UpdateBook, DeleteBook, GetBooksByUser, GetMyBooks } = require('../controllers/BookController');

// Public routes
BookRoute.get('/books', GetAllBooks);
BookRoute.get('/books/:id', GetBookById);
BookRoute.get('/books/user/:userId', GetBooksByUser);

// Protected routes - require authentication
BookRoute.post('/books', uploadBookCover, handleUploadError, authenticateUser, canPublish, CreateBook);
BookRoute.post('/my-books', authenticateUser, GetMyBooks);
BookRoute.put('/books/:id', uploadBookCover, handleUploadError, authenticateUser, UpdateBook);
BookRoute.delete('/books/:id', authenticateUser, DeleteBook);

module.exports = BookRoute;