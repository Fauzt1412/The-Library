const Router = require('express').Router;
const GameRoute = Router();
const { authenticateUser, canPublish, requireAdmin } = require('../middleware/auth');
const { uploadGameCover, handleUploadError } = require('../middleware/upload');

const { GetAllGames, GetGameById, CreateGame, UpdateGame, DeleteGame, GetGamesByUser, GetMyGames } = require('../controllers/GameController');

// Public routes
GameRoute.get('/games', GetAllGames);
GameRoute.get('/games/:id', GetGameById);
GameRoute.get('/games/user/:userId', GetGamesByUser);

// Middleware to conditionally apply multer based on content type
const conditionalUpload = (req, res, next) => {
    // Check if it's a JSON request (Cloudinary upload)
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        console.log('🎮 GameRoute - JSON request detected, skipping multer');
        return next();
    }
    // Apply multer for FormData requests (traditional file upload)
    console.log('🎮 GameRoute - FormData request detected, applying multer');
    uploadGameCover(req, res, (err) => {
        if (err) {
            return handleUploadError(err, req, res, next);
        }
        next();
    });
};

// Protected routes - require authentication
GameRoute.post('/games', conditionalUpload, authenticateUser, canPublish, CreateGame);
GameRoute.post('/my-games', authenticateUser, GetMyGames);
GameRoute.put('/games/:id', conditionalUpload, authenticateUser, UpdateGame);
GameRoute.delete('/games/:id', authenticateUser, DeleteGame);

module.exports = GameRoute;