const ChatMessage = require('../models/chat');
const User = require('../models/users');

class ChatController {
  static async getMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      
      const messages = await ChatMessage.getMessagesPaginated(page, limit);
      const reversedMessages = messages.reverse();
      
      res.json({
        success: true,
        messages: reversedMessages,
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message
      });
    }
  }

  static async sendMessage(req, res) {
    try {
      const { message, messageType = 'user', isNotice = false } = req.body;
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Message too long (max 1000 characters)'
        });
      }

      const user = await User.findById(userId).select('username role');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let finalMessageType = messageType;
      if (user.role === 'admin' && messageType === 'user') {
        finalMessageType = 'admin';
      }

      const newMessage = new ChatMessage({
        user: userId,
        username: user.username,
        message: message.trim(),
        messageType: finalMessageType,
        isNotice: isNotice && user.role === 'admin'
      });

      const savedMessage = await newMessage.save();
      await savedMessage.populate('user', 'username role');

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: savedMessage
      });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }

  static async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const user = await User.findById(userId).select('role');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const message = await ChatMessage.findById(messageId);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      if (user.role !== 'admin' && message.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this message'
        });
      }

      await message.softDelete(userId);

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: error.message
      });
    }
  }

  static async clearAllMessages(req, res) {
    try {
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const user = await User.findById(userId).select('role username');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can clear all messages'
        });
      }

      // Hard delete all messages - permanently remove from database
      const result = await ChatMessage.deleteMany({});

      // Notify all connected clients via Socket.IO
      const socketService = require('../../services/socketService');
      socketService.clearChatForAll();

      console.log(`🗑️ Admin ${user.username} permanently deleted all chat messages (${result.deletedCount} messages)`);

      res.json({
        success: true,
        message: 'All messages permanently deleted from database',
        deletedCount: result.deletedCount
      });

    } catch (error) {
      console.error('Error clearing all messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear all messages',
        error: error.message
      });
    }
  }

  static async clearCache(req, res) {
    const userId = req.headers['x-user-id'];
    
    try {
      // Simple admin check
      const user = await User.findById(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      // SUPER SIMPLE: Just delete everything like books do
      const result = await ChatMessage.deleteMany({});
      
      console.log(`🗑️ SIMPLE DELETE: Removed ${result.deletedCount} messages`);
      
      res.status(200).json({ 
        message: 'All messages deleted successfully',
        deletedCount: result.deletedCount 
      });
      
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete messages' });
    }
  }

  static async getOnlineUsers(req, res) {
    try {
      console.log('📊 [PUBLIC ENDPOINT] Getting online users');
      console.log('📊 Request method:', req.method);
      console.log('📊 Request headers:', req.headers);
      console.log('📊 Request query:', req.query);
      console.log('📊 Request body:', req.body);
      
      const socketService = require('../../services/socketService');
      
      // This endpoint is public - no authentication required
      // Online users should be visible to everyone
      console.log('📊 This is a PUBLIC endpoint - no auth required');
      
      // Get all connected users (including those not in chat)
      const allConnectedUsers = socketService.getAllConnectedUsersList();
      const connectedCount = socketService.getAllConnectedUsersCount();
      
      // Get chat room members only
      const chatUsers = socketService.getOnlineUsersList();
      const chatCount = socketService.getOnlineUsersCount();
      
      console.log(`📊 Returning ${connectedCount} connected users, ${chatCount} in chat`);
      
      const response = {
        success: true,
        connected: {
          count: connectedCount,
          users: allConnectedUsers
        },
        inChat: {
          count: chatCount,
          users: chatUsers
        },
        // For backward compatibility
        onlineCount: connectedCount,
        users: allConnectedUsers,
        // Debug info
        timestamp: new Date().toISOString(),
        endpoint: 'PUBLIC - /chat/online'
      };
      
      console.log('📊 Sending response:', JSON.stringify(response, null, 2));
      
      res.status(200).json(response);
    } catch (error) {
      console.error('❌ Error getting online users:', error);
      console.error('❌ Error stack:', error.stack);
      
      const errorResponse = {
        success: false,
        message: 'Failed to get online users',
        error: error.message,
        connected: {
          count: 0,
          users: []
        },
        inChat: {
          count: 0,
          users: []
        },
        onlineCount: 0,
        users: [],
        timestamp: new Date().toISOString(),
        endpoint: 'PUBLIC - /chat/online'
      };
      
      console.log('❌ Sending error response:', JSON.stringify(errorResponse, null, 2));
      
      res.status(500).json(errorResponse);
    }
  }
}

module.exports = ChatController;