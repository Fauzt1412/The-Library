const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');

// Import all controller functions
const {
    GetUserFavorites,
    AddToFavorites,
    RemoveFromFavorites,
    CheckFavorite,
    ToggleFavorite,
    ClearAllFavorites,
    GetFavoritesCount
} = require('../controllers/FavoriteController');

// Middleware to ensure all routes require authentication
router.use(authenticateUser);

// Route: GET /API/favorites
// Description: Get all favorites for the authenticated user
// Access: Private (requires authentication)
router.get(
    '/favorites',
    GetUserFavorites
);

// Route: GET /API/favorites/count
// Description: Get the count of favorites for the authenticated user
// Access: Private (requires authentication)
router.get(
    '/favorites/count',
    GetFavoritesCount
);

// Route: GET /API/favorites/check
// Description: Check if a specific item is in user's favorites
// Query params: contentId, contentType
// Access: Private (requires authentication)
router.get(
    '/favorites/check',
    CheckFavorite
);

// Route: POST /API/favorites/add
// Description: Add an item to user's favorites
// Body: { contentId, contentType }
// Access: Private (requires authentication)
router.post(
    '/favorites/add',
    AddToFavorites
);

// Route: POST /API/favorites/remove
// Description: Remove an item from user's favorites
// Body: { contentId, contentType }
// Access: Private (requires authentication)
router.post(
    '/favorites/remove',
    RemoveFromFavorites
);

// Route: POST /API/favorites/toggle
// Description: Toggle favorite status (add if not favorited, remove if favorited)
// Body: { contentId, contentType }
// Access: Private (requires authentication)
router.post(
    '/favorites/toggle',
    ToggleFavorite
);

// Route: DELETE /API/favorites/clear
// Description: Clear all favorites for the authenticated user
// Access: Private (requires authentication)
router.delete(
    '/favorites/clear',
    ClearAllFavorites
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
    console.error('Favorites Route Error:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: Object.values(error.errors).map(err => err.message)
        });
    }
    
    if (error.code === 11000) {
        return res.status(400).json({
            error: 'Duplicate Entry',
            message: 'This item is already in your favorites'
        });
    }
    
    if (error.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID Format',
            message: 'The provided ID is not valid'
        });
    }
    
    return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing your request'
    });
});

module.exports = router;