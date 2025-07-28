const User = require('../models/users');

/**
 * Get user profile information
 * @route GET /API/user/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
    try {
        console.log('👤 Fetching user profile for:', req.user._id);
        
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        console.log('✅ User profile fetched successfully');
        
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        return res.status(500).json({
            success: false,
            error: 'Error fetching user profile',
            message: error.message
        });
    }
};

/**
 * Update user profile information
 * @route PUT /API/user/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user._id;
        
        console.log('📝 Updating user profile for:', userId);
        console.log('New data:', { username, email });
        
        // Validate input
        if (!username && !email) {
            return res.status(400).json({
                success: false,
                error: 'At least one field (username or email) is required'
            });
        }
        
        // Check if username is already taken (if provided)
        if (username) {
            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: userId } 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is already taken'
                });
            }
        }
        
        // Check if email is already taken (if provided)
        if (email) {
            const existingUser = await User.findOne({ 
                email, 
                _id: { $ne: userId } 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is already taken'
                });
            }
        }
        
        // Update user
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        updateData.updatedAt = new Date();
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        console.log('✅ User profile updated successfully');
        
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating user profile:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Error updating user profile',
            message: error.message
        });
    }
};

/**
 * Change user password
 * @route PUT /API/user/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;
        
        console.log('🔒 Changing password for user:', userId);
        
        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'All password fields are required'
            });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'New password and confirmation do not match'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters long'
            });
        }
        
        // Get user with password
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Verify current password (simple comparison for original system)
        if (currentPassword !== user.password) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }
        
        // Update password (plain text for original system)
        await User.findByIdAndUpdate(userId, {
            password: newPassword,
            updatedAt: new Date()
        });
        
        console.log('✅ Password changed successfully');
        
        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('❌ Error changing password:', error);
        return res.status(500).json({
            success: false,
            error: 'Error changing password',
            message: error.message
        });
    }
};

/**
 * Delete user account
 * @route DELETE /API/user/account
 * @access Private
 */
const deleteUserAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user._id;
        
        console.log('🗑️ Deleting account for user:', userId);
        
        // Validate password
        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required to delete account'
            });
        }
        
        // Get user with password
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Verify password (simple comparison for original system)
        if (password !== user.password) {
            return res.status(400).json({
                success: false,
                error: 'Password is incorrect'
            });
        }
        
        // Delete user account
        await User.findByIdAndDelete(userId);
        
        console.log('✅ Account deleted successfully');
        
        return res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting account:', error);
        return res.status(500).json({
            success: false,
            error: 'Error deleting account',
            message: error.message
        });
    }
};

/**
 * Get all users (Admin only)
 * @route GET /API/users
 * @access Private (Admin only)
 */
const getAllUsers = async (req, res) => {
    try {
        console.log('👥 Admin fetching all users');
        
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        console.log(`✅ Found ${users.length} users`);
        
        return res.status(200).json({
            success: true,
            data: users.map(user => ({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }))
        });
        
    } catch (error) {
        console.error('❌ Error fetching all users:', error);
        return res.status(500).json({
            success: false,
            error: 'Error fetching users',
            message: error.message
        });
    }
};

/**
 * Create new user (Admin only)
 * @route POST /API/users
 * @access Private (Admin only)
 */
const createUser = async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;
        
        console.log('👤 Admin creating new user:', { username, email, role });
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required'
            });
        }
        
        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                error: 'Username is already taken'
            });
        }
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                error: 'Email is already taken'
            });
        }
        
        // Create new user
        const newUser = new User({
            username,
            email,
            password, // Plain text for original system
            role: ['user', 'admin'].includes(role) ? role : 'user'
        });
        
        await newUser.save();
        
        console.log('✅ User created successfully:', newUser._id);
        
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating user:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Error creating user',
            message: error.message
        });
    }
};

/**
 * Update user by ID (Admin only)
 * @route PUT /API/users/:id
 * @access Private (Admin only)
 */
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;
        
        console.log('📝 Admin updating user:', id, { username, email, role });
        
        // Validate input
        if (!username && !email && !password && !role) {
            return res.status(400).json({
                success: false,
                error: 'At least one field is required to update'
            });
        }
        
        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Check if username is already taken (if provided)
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: id } 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is already taken'
                });
            }
        }
        
        // Check if email is already taken (if provided)
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ 
                email, 
                _id: { $ne: id } 
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is already taken'
                });
            }
        }
        
        // Build update data
        const updateData = { updatedAt: new Date() };
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) updateData.password = password; // Plain text for original system
        if (role && ['user', 'admin'].includes(role)) updateData.role = role;
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        console.log('✅ User updated successfully');
        
        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating user:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Error updating user',
            message: error.message
        });
    }
};

/**
 * Delete user by ID (Admin only)
 * @route DELETE /API/users/:id
 * @access Private (Admin only)
 */
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Admin deleting user:', id);
        
        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Prevent admin from deleting themselves
        if (req.user._id.toString() === id) {
            return res.status(400).json({
                success: false,
                error: 'You cannot delete your own account from admin panel'
            });
        }
        
        // Delete user
        await User.findByIdAndDelete(id);
        
        console.log('✅ User deleted successfully');
        
        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Error deleting user',
            message: error.message
        });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteUserAccount,
    // Admin functions
    getAllUsers,
    createUser,
    updateUserById,
    deleteUserById
};