const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Import controller functions
const {
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteUserAccount,
    // Admin functions
    getAllUsers,
    createUser,
    updateUserById,
    deleteUserById
} = require('../controllers/UserController');

// Route: GET /API/user/profile
// Description: Get user profile information
// Access: Private (requires authentication)
router.get(
    '/user/profile',
    authenticateUser,
    getUserProfile
);

// Route: PUT /API/user/profile
// Description: Update user profile information (username, email)
// Body: { username?, email? }
// Access: Private (requires authentication)
router.put(
    '/user/profile',
    authenticateUser,
    updateUserProfile
);

// Route: PUT /API/user/change-password
// Description: Change user password
// Body: { currentPassword, newPassword, confirmPassword }
// Access: Private (requires authentication)
router.put(
    '/user/change-password',
    authenticateUser,
    changePassword
);

// Route: DELETE /API/user/account
// Description: Delete user account
// Body: { password }
// Access: Private (requires authentication)
router.delete(
    '/user/account',
    authenticateUser,
    deleteUserAccount
);

// ===== ADMIN ROUTES =====
// These routes require admin privileges

// Route: GET /API/users
// Description: Get all users (admin only)
// Access: Private (requires admin authentication)
router.get(
    '/users',
    authenticateUser,
    requireAdmin,
    getAllUsers
);

// Route: POST /API/users
// Description: Create new user (admin only)
// Body: { username, email, password, role? }
// Access: Private (requires admin authentication)
router.post(
    '/users',
    authenticateUser,
    requireAdmin,
    createUser
);

// Route: PUT /API/users/:id
// Description: Update user by ID (admin only)
// Body: { username?, email?, password?, role? }
// Access: Private (requires admin authentication)
router.put(
    '/users/:id',
    authenticateUser,
    requireAdmin,
    updateUserById
);

// Route: DELETE /API/users/:id
// Description: Delete user by ID (admin only)
// Access: Private (requires admin authentication)
router.delete(
    '/users/:id',
    authenticateUser,
    requireAdmin,
    deleteUserById
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
    console.error('User Route Error:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: Object.values(error.errors).map(err => err.message)
        });
    }
    
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
            success: false,
            error: 'Duplicate Entry',
            message: `${field} is already taken`
        });
    }
    
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID Format',
            message: 'The provided ID is not valid'
        });
    }
    
    return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing your request'
    });
});

module.exports = router;