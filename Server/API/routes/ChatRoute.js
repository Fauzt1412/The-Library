const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');

// Get chat messages
router.get('/chat/messages', ChatController.getMessages);

// Send a new message
router.post('/chat/messages', ChatController.sendMessage);

// Delete a message
router.delete('/chat/messages/:messageId', ChatController.deleteMessage);

// Clear all messages (admin only)
router.delete('/chat/messages', ChatController.clearAllMessages);

// Clear cache - permanently delete ALL data (admin only)
router.delete('/chat/cache', ChatController.clearCache);

// Get online users
router.get('/chat/online', ChatController.getOnlineUsers);

module.exports = router;