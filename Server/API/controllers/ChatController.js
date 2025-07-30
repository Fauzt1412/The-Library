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

  static async getOnlineUsers(req, res) {
    try {
      res.json({
        success: true,
        onlineCount: 0,
        users: []
      });
    } catch (error) {
      console.error('Error getting online users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get online users',
        error: error.message
      });
    }
  }
}

module.exports = ChatController;