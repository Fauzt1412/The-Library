const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// PUBLIC ROUTES - No authentication required
// Test endpoint to verify route is working
router.get('/chat/test', (req, res) => {
  console.log('📊 [TEST] Chat test endpoint hit');
  res.json({
    success: true,
    message: 'Chat route is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers
  });
});

// Get online users - PUBLIC endpoint, anyone can see who's online
router.get('/chat/online', ChatController.getOnlineUsers);

// Get chat messages - PUBLIC for now (consider adding auth later)
router.get('/chat/messages', ChatController.getMessages);

// PROTECTED ROUTES - Require authentication
// Send a new message
router.post('/chat/messages', ChatController.sendMessage);

// Delete a message
router.delete('/chat/messages/:messageId', ChatController.deleteMessage);

// ADMIN ONLY ROUTES
// Clear all messages (admin only)
router.delete('/chat/messages', ChatController.clearAllMessages);

// Clear cache - permanently delete ALL data (admin only)
router.delete('/chat/cache', ChatController.clearCache);

module.exports = router;