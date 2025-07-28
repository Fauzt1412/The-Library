const Favorite = require('../models/favorites');
const Book = require('../models/books');
const Game = require('../models/games');

/**
 * Get all favorites for the authenticated user
 * @route GET /API/favorites
 * @access Private
 */
const GetUserFavorites = async (req, res) => {
    try {
        console.log('📋 Fetching favorites for user:', req.user._id);
        
        // Use the static method from the model
        const favorites = await Favorite.findByUser(req.user._id);
        
        console.log('📋 Found', favorites.length, 'favorites');
        
        // Populate the actual content for each favorite
        const populatedFavorites = [];
        
        for (let favorite of favorites) {
            try {
                let content = null;
                
                if (favorite.contentType === 'book') {
                    content = await Book.findById(favorite.contentId);
                } else if (favorite.contentType === 'game') {
                    content = await Game.findById(favorite.contentId);
                }
                
                if (content) {
                    populatedFavorites.push({
                        id: favorite.contentId,
                        type: favorite.contentType,
                        data: content,
                        addedAt: favorite.addedAt
                    });
                } else {
                    console.warn('⚠️ Content not found for favorite:', favorite._id);
                    // Remove orphaned favorite
                    await Favorite.findByIdAndDelete(favorite._id);
                }
            } catch (error) {
                console.error('❌ Error populating favorite:', favorite._id, error.message);
            }
        }
        
        console.log('✅ Successfully populated', populatedFavorites.length, 'favorites');
        
        return res.status(200).json({
            success: true,
            count: populatedFavorites.length,
            data: populatedFavorites
        });
        
    } catch (error) {
        console.error('❌ Error fetching user favorites:', error);
        return res.status(500).json({
            success: false,
            error: 'Error fetching favorites',
            message: error.message
        });
    }
};

/**
 * Add an item to user's favorites
 * @route POST /API/favorites/add
 * @access Private
 */
const AddToFavorites = async (req, res) => {
    try {
        const { contentId, contentType } = req.body;
        
        console.log('❤️ Adding to favorites:', {
            userId: req.user._id,
            contentId,
            contentType
        });
        
        // Validate required fields
        if (!contentId || !contentType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'contentId and contentType are required'
            });
        }
        
        // Validate content type
        if (!['book', 'game'].includes(contentType.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content type',
                message: 'Content type must be "book" or "game"'
            });
        }
        
        // Validate that the content exists
        let content = null;
        if (contentType === 'book') {
            content = await Book.findById(contentId);
        } else {
            content = await Game.findById(contentId);
        }
        
        if (!content) {
            return res.status(404).json({
                success: false,
                error: 'Content not found',
                message: `${contentType} with ID ${contentId} not found`
            });
        }
        
        // Check if already favorited using static method
        const existingFavorite = await Favorite.checkIfFavorited(
            req.user._id,
            contentId,
            contentType
        );
        
        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                error: 'Already favorited',
                message: 'This item is already in your favorites'
            });
        }
        
        // Create new favorite
        const favorite = new Favorite({
            userId: req.user._id,
            contentId,
            contentType: contentType.toLowerCase()
        });
        
        await favorite.save();
        
        console.log('✅ Added to favorites successfully:', favorite._id);
        
        return res.status(201).json({
            success: true,
            message: 'Added to favorites successfully',
            favorite: {
                id: contentId,
                type: contentType,
                data: content,
                addedAt: favorite.addedAt
            }
        });
        
    } catch (error) {
        console.error('❌ Error adding to favorites:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate favorite',
                message: 'This item is already in your favorites'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Error adding to favorites',
            message: error.message
        });
    }
};

/**
 * Remove an item from user's favorites
 * @route POST /API/favorites/remove
 * @access Private
 */
const RemoveFromFavorites = async (req, res) => {
    try {
        const { contentId, contentType } = req.body;
        
        console.log('💔 Removing from favorites:', {
            userId: req.user._id,
            contentId,
            contentType
        });
        
        // Validate required fields
        if (!contentId || !contentType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'contentId and contentType are required'
            });
        }
        
        // Use static method to remove favorite
        const result = await Favorite.removeUserFavorite(
            req.user._id,
            contentId,
            contentType
        );
        
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Favorite not found',
                message: 'This item is not in your favorites'
            });
        }
        
        console.log('✅ Removed from favorites successfully');
        
        return res.status(200).json({
            success: true,
            message: 'Removed from favorites successfully'
        });
        
    } catch (error) {
        console.error('❌ Error removing from favorites:', error);
        return res.status(500).json({
            success: false,
            error: 'Error removing from favorites',
            message: error.message
        });
    }
};

/**
 * Check if an item is in user's favorites
 * @route GET /API/favorites/check
 * @access Private
 */
const CheckFavorite = async (req, res) => {
    try {
        const { contentId, contentType } = req.query;
        
        // Validate required fields
        if (!contentId || !contentType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters',
                message: 'contentId and contentType query parameters are required'
            });
        }
        
        // Use static method to check if favorited
        const favorite = await Favorite.checkIfFavorited(
            req.user._id,
            contentId,
            contentType
        );
        
        return res.status(200).json({
            success: true,
            isFavorite: !!favorite,
            favoriteId: favorite ? favorite._id : null
        });
        
    } catch (error) {
        console.error('❌ Error checking favorite:', error);
        return res.status(500).json({
            success: false,
            error: 'Error checking favorite',
            message: error.message
        });
    }
};

/**
 * Toggle favorite status (add if not favorited, remove if favorited)
 * @route POST /API/favorites/toggle
 * @access Private
 */
const ToggleFavorite = async (req, res) => {
    try {
        const { contentId, contentType } = req.body;
        
        console.log('🔄 Toggling favorite:', {
            userId: req.user._id,
            contentId,
            contentType
        });
        
        // Validate required fields
        if (!contentId || !contentType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'contentId and contentType are required'
            });
        }
        
        // Validate content type
        if (!['book', 'game'].includes(contentType.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid content type',
                message: 'Content type must be "book" or "game"'
            });
        }
        
        // Check if already favorited
        const existingFavorite = await Favorite.checkIfFavorited(
            req.user._id,
            contentId,
            contentType
        );
        
        if (existingFavorite) {
            // Remove from favorites
            await Favorite.findByIdAndDelete(existingFavorite._id);
            console.log('✅ Removed from favorites');
            
            return res.status(200).json({
                success: true,
                message: 'Removed from favorites',
                isFavorite: false,
                action: 'removed'
            });
        } else {
            // Add to favorites
            // First validate that the content exists
            let content = null;
            if (contentType === 'book') {
                content = await Book.findById(contentId);
            } else {
                content = await Game.findById(contentId);
            }
            
            if (!content) {
                return res.status(404).json({
                    success: false,
                    error: 'Content not found',
                    message: `${contentType} with ID ${contentId} not found`
                });
            }
            
            const favorite = new Favorite({
                userId: req.user._id,
                contentId,
                contentType: contentType.toLowerCase()
            });
            
            await favorite.save();
            console.log('✅ Added to favorites');
            
            return res.status(200).json({
                success: true,
                message: 'Added to favorites',
                isFavorite: true,
                action: 'added',
                favorite: {
                    id: contentId,
                    type: contentType,
                    data: content,
                    addedAt: favorite.addedAt
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error toggling favorite:', error);
        return res.status(500).json({
            success: false,
            error: 'Error toggling favorite',
            message: error.message
        });
    }
};

/**
 * Clear all favorites for the authenticated user
 * @route DELETE /API/favorites/clear
 * @access Private
 */
const ClearAllFavorites = async (req, res) => {
    try {
        console.log('🗑️ Clearing all favorites for user:', req.user._id);
        
        // Use static method to clear all user favorites
        const result = await Favorite.clearUserFavorites(req.user._id);
        
        console.log('✅ Cleared', result.deletedCount, 'favorites');
        
        return res.status(200).json({
            success: true,
            message: `Cleared ${result.deletedCount} favorites successfully`,
            deletedCount: result.deletedCount
        });
        
    } catch (error) {
        console.error('❌ Error clearing favorites:', error);
        return res.status(500).json({
            success: false,
            error: 'Error clearing favorites',
            message: error.message
        });
    }
};

/**
 * Get the count of favorites for the authenticated user
 * @route GET /API/favorites/count
 * @access Private
 */
const GetFavoritesCount = async (req, res) => {
    try {
        // Use static method to get count
        const count = await Favorite.getUserFavoritesCount(req.user._id);
        
        return res.status(200).json({
            success: true,
            count: count,
            message: `You have ${count} favorite${count !== 1 ? 's' : ''}`
        });
        
    } catch (error) {
        console.error('❌ Error getting favorites count:', error);
        return res.status(500).json({
            success: false,
            error: 'Error getting favorites count',
            message: error.message
        });
    }
};

module.exports = {
    GetUserFavorites,
    AddToFavorites,
    RemoveFromFavorites,
    CheckFavorite,
    ToggleFavorite,
    ClearAllFavorites,
    GetFavoritesCount
};