const Router = require('express').Router;
const BookRoute = Router();
const { authenticateUser, canPublish, requireAdmin } = require('../middleware/auth');
const { uploadBookCover, handleUploadError } = require('../middleware/upload');

const { GetAllBooks, GetBookById, CreateBook, UpdateBook, DeleteBook, GetBooksByUser, GetMyBooks } = require('../controllers/BookController');

// Public routes
BookRoute.get('/books', GetAllBooks);
BookRoute.get('/books/:id', GetBookById);
BookRoute.get('/books/user/:userId', GetBooksByUser);

// Middleware to conditionally apply multer based on content type
const conditionalUpload = (req, res, next) => {
    // Check if it's a JSON request (Cloudinary upload)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        console.log('📝 BookRoute - JSON request detected, skipping multer');
        return next();
    }
    // Apply multer for FormData requests (traditional file upload)
    console.log('📝 BookRoute - FormData request detected, applying multer');
    uploadBookCover(req, res, (err) => {
        if (err) {
            return handleUploadError(err, req, res, next);
        }
        next();
    });
};

// Protected routes - require authentication
BookRoute.post('/books', conditionalUpload, authenticateUser, canPublish, CreateBook);
BookRoute.post('/my-books', authenticateUser, GetMyBooks);
BookRoute.put('/books/:id', conditionalUpload, authenticateUser, UpdateBook);
BookRoute.delete('/books/:id', authenticateUser, DeleteBook);

module.exports = BookRoute;