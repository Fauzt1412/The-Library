const Router = require('express').Router;
const GameRoute = Router();
const { authenticateUser, canPublish, requireAdmin } = require('../middleware/auth');
const { uploadGameCover, handleUploadError } = require('../middleware/upload');

const { GetAllGames, GetGameById, CreateGame, UpdateGame, DeleteGame, GetGamesByUser, GetMyGames } = require('../controllers/GameController');

// Public routes
GameRoute.get('/games', GetAllGames);
GameRoute.get('/games/:id', GetGameById);
GameRoute.get('/games/user/:userId', GetGamesByUser);

// Protected routes - require authentication
GameRoute.post('/games', uploadGameCover, handleUploadError, authenticateUser, canPublish, CreateGame);
GameRoute.post('/my-games', authenticateUser, GetMyGames);
GameRoute.put('/games/:id', uploadGameCover, handleUploadError, authenticateUser, UpdateGame);
GameRoute.delete('/games/:id', authenticateUser, DeleteGame);

module.exports = GameRoute;