const User = require('../models/users');

// Middleware to check if user is authenticated (basic check)
const authenticateUser = async (req, res, next) => {
    try {
        console.log('🔐 Auth middleware - Method:', req.method, 'URL:', req.url);
        
        // Get userId from body, query params, or headers
        // Ensure req.body exists before accessing it
        const bodyUserId = req.body && req.body.userId;
        let userId = bodyUserId || req.query.userId || req.headers['x-user-id'];
        
        console.log('🔐 Auth middleware - userId sources:');
        console.log('   Body userId:', bodyUserId);
        console.log('   Query userId:', req.query.userId);
        console.log('   Header userId:', req.headers['x-user-id']);
        console.log('   Final userId:', userId);
        
        if (!userId) {
            console.log('❌ Auth middleware - No userId found');
            return res.status(401).json({ error: 'User ID is required for this operation' });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ Auth middleware - User not found for ID:', userId);
            return res.status(401).json({ error: 'Invalid user' });
        }

        console.log('✅ Auth middleware - User authenticated:', user.username);
        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Authentication error:', error);
        res.status(500).json({ error: 'Authentication error: ' + error.message });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// Middleware to check if user can publish (user or admin)
const canPublish = (req, res, next) => {
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Publishing permission required' });
    }
};

module.exports = {
    authenticateUser,
    requireAdmin,
    canPublish
};