const { Server } = require('socket.io');
const ChatMessage = require('../API/models/chat');
const User = require('../API/models/users');

class SocketService {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map();
    this.userSockets = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https://the-library-seven.vercel.app',
          process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('🔌 Socket.IO initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 User connected: ${socket.id}`);

      socket.on('join-chat', async (data) => {
        try {
          const { userId, username } = data;
          
          if (!userId || !username) {
            socket.emit('error', { message: 'Invalid user data' });
            return;
          }

          const user = await User.findById(userId).select('username role');
          if (!user) {
            socket.emit('error', { message: 'User not found' });
            return;
          }

          this.onlineUsers.set(userId, {
            socketId: socket.id,
            username: user.username,
            role: user.role || 'user'
          });
          this.userSockets.set(socket.id, userId);

          socket.join('chat-room');

          const recentMessages = await ChatMessage.getRecentMessages(50);
          socket.emit('recent-messages', recentMessages.reverse());

          socket.to('chat-room').emit('user-joined', {
            userId,
            username: user.username,
            timestamp: new Date()
          });

          this.broadcastOnlineUsers();

          console.log(`✅ User ${user.username} joined chat`);
        } catch (error) {
          console.error('Error in join-chat:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      socket.on('send-message', async (data) => {
        try {
          const userId = this.userSockets.get(socket.id);
          if (!userId) {
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          const { message, messageType = 'user', isNotice = false } = data;

          if (!message || message.trim().length === 0) {
            socket.emit('error', { message: 'Message cannot be empty' });
            return;
          }

          if (message.length > 1000) {
            socket.emit('error', { message: 'Message too long (max 1000 characters)' });
            return;
          }

          const user = await User.findById(userId).select('username role');
          if (!user) {
            socket.emit('error', { message: 'User not found' });
            return;
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

          this.io.to('chat-room').emit('new-message', savedMessage);

          console.log(`💬 Message from ${user.username}: ${message.substring(0, 50)}...`);
        } catch (error) {
          console.error('Error in send-message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('delete-message', async (data) => {
        try {
          const userId = this.userSockets.get(socket.id);
          if (!userId) {
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          const { messageId } = data;
          const user = await User.findById(userId).select('role');
          const message = await ChatMessage.findById(messageId);

          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }

          if (user.role !== 'admin' && message.user.toString() !== userId) {
            socket.emit('error', { message: 'Not authorized to delete this message' });
            return;
          }

          await message.softDelete(userId);

          this.io.to('chat-room').emit('message-deleted', { messageId });

          console.log(`🗑️ Message ${messageId} deleted by ${user.username || 'user'}`);
        } catch (error) {
          console.error('Error in delete-message:', error);
          socket.emit('error', { message: 'Failed to delete message' });
        }
      });

      socket.on('typing-start', (data) => {
        const userId = this.userSockets.get(socket.id);
        if (userId) {
          const userInfo = this.onlineUsers.get(userId);
          if (userInfo) {
            socket.to('chat-room').emit('user-typing', {
              userId,
              username: userInfo.username
            });
          }
        }
      });

      socket.on('typing-stop', (data) => {
        const userId = this.userSockets.get(socket.id);
        if (userId) {
          socket.to('chat-room').emit('user-stop-typing', { userId });
        }
      });

      socket.on('clear-all-messages', async (data) => {
        try {
          const userId = this.userSockets.get(socket.id);
          if (!userId) {
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          const user = await User.findById(userId).select('role username');
          if (!user) {
            socket.emit('error', { message: 'User not found' });
            return;
          }

          if (user.role !== 'admin') {
            socket.emit('error', { message: 'Only administrators can clear all messages' });
            return;
          }

          // Hard delete all messages - permanently remove from database
          const result = await ChatMessage.deleteMany({});

          // Notify all connected clients
          this.io.to('chat-room').emit('chat-cleared');

          console.log(`🗑️ Admin ${user.username} permanently deleted all chat messages via Socket.IO (${result.deletedCount} messages)`);
        } catch (error) {
          console.error('Error in clear-all-messages:', error);
          socket.emit('error', { message: 'Failed to clear all messages' });
        }
      });

      socket.on('clear-cache', async (data) => {
        console.log('🔍 Clear cache event received from client');
        console.log('Data:', data);
        
        try {
          const userId = this.userSockets.get(socket.id);
          console.log('User ID from socket:', userId);
          
          if (!userId) {
            console.log('❌ User not authenticated');
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          const user = await User.findById(userId).select('role username');
          console.log('User found:', user?.username, 'Role:', user?.role);
          
          if (!user) {
            console.log('❌ User not found in database');
            socket.emit('error', { message: 'User not found' });
            return;
          }

          if (user.role !== 'admin') {
            console.log('❌ User is not admin');
            socket.emit('error', { message: 'Only administrators can clear cache' });
            return;
          }

          console.log('🗑️ Starting cache clear process...');
          
          // MULTIPLE DELETION STRATEGIES - Use the most aggressive approach
          let deletedCount = 0;
          
          try {
            // Strategy 1: Use SAME method as books/games - findByIdAndDelete
            console.log('Strategy 1: Using findByIdAndDelete (same as books/games)...');
            const allMessages = await ChatMessage.find({}, '_id');
            const messageIds = allMessages.map(msg => msg._id);
            deletedCount = messageIds.length;
            
            console.log(`Found ${deletedCount} messages to delete`);
            
            // Delete each message using findByIdAndDelete (same as books/games)
            for (const messageId of messageIds) {
              await ChatMessage.findByIdAndDelete(messageId);
            }
            console.log(`✅ Successfully deleted ${deletedCount} messages using findByIdAndDelete`);
            
            // Strategy 2: Try to drop collection for complete cleanup
            console.log('Strategy 2: Attempting to drop collection...');
            await ChatMessage.collection.drop();
            console.log('✅ Collection dropped successfully');
            
          } catch (dropError) {
            console.log('⚠️ Collection drop failed, but documents were deleted:', dropError.message);
            // This is fine, deleteMany already worked
          }
          
          // Strategy 3: Ensure collection exists and is empty
          try {
            const remainingCount = await ChatMessage.countDocuments({});
            console.log(`Remaining documents after cleanup: ${remainingCount}`);
            
            if (remainingCount > 0) {
              console.log('Force deleting remaining documents with RAW MongoDB...');
              await ChatMessage.collection.deleteMany({});
            }
          } catch (countError) {
            console.log('Count check failed, but cleanup likely successful:', countError.message);
          }

          // Notify all connected clients
          this.io.to('chat-room').emit('chat-cleared');
          
          // Send success response to the requesting client
          socket.emit('cache-cleared', { 
            success: true, 
            deletedCount: deletedCount,
            message: 'Cache cleared successfully'
          });

          console.log(`🗑️💾 CACHE CLEARED: Admin ${user.username} permanently wiped ALL chat data`);
          console.log(`✅ Total documents deleted: ${deletedCount}`);
          console.log('⚠️ Database completely cleared - all messages permanently deleted');
          
        } catch (error) {
          console.error('❌ Error in clear-cache:', error);
          socket.emit('error', { message: 'Failed to clear cache: ' + error.message });
        }
      });

      socket.on('leave-chat', async (data) => {
        try {
          const { userId, username } = data;
          
          if (!userId) {
            socket.emit('error', { message: 'Invalid user data' });
            return;
          }

          const userInfo = this.onlineUsers.get(userId);
          
          // Remove user from chat room but keep socket connection
          socket.leave('chat-room');
          this.onlineUsers.delete(userId);
          this.userSockets.delete(socket.id);

          if (userInfo) {
            socket.to('chat-room').emit('user-left', {
              userId,
              username: userInfo.username,
              timestamp: new Date()
            });
          }

          this.broadcastOnlineUsers();

          console.log(`👋 User ${userInfo?.username || username} left chat (connection maintained)`);
        } catch (error) {
          console.error('Error in leave-chat:', error);
          socket.emit('error', { message: 'Failed to leave chat' });
        }
      });

      socket.on('disconnect', () => {
        const userId = this.userSockets.get(socket.id);
        if (userId) {
          const userInfo = this.onlineUsers.get(userId);
          
          this.onlineUsers.delete(userId);
          this.userSockets.delete(socket.id);

          if (userInfo) {
            socket.to('chat-room').emit('user-left', {
              userId,
              username: userInfo.username,
              timestamp: new Date()
            });
          }

          this.broadcastOnlineUsers();

          console.log(`👋 User ${userInfo?.username || 'unknown'} left chat`);
        }
        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });
  }

  broadcastOnlineUsers() {
    const onlineUsersArray = Array.from(this.onlineUsers.entries()).map(([userId, info]) => ({
      userId,
      username: info.username,
      role: info.role
    }));

    this.io.to('chat-room').emit('online-users-updated', {
      count: onlineUsersArray.length,
      users: onlineUsersArray
    });
  }

  async sendSystemMessage(message, adminUserId) {
    try {
      const systemMessage = new ChatMessage({
        user: adminUserId,
        username: 'System',
        message: message,
        messageType: 'system'
      });

      const savedMessage = await systemMessage.save();
      await savedMessage.populate('user', 'username role');

      this.io.to('chat-room').emit('new-message', savedMessage);

      return savedMessage;
    } catch (error) {
      console.error('Error sending system message:', error);
      throw error;
    }
  }

  clearChatForAll() {
    this.io.to('chat-room').emit('chat-cleared');
  }

  getOnlineUsersCount() {
    return this.onlineUsers.size;
  }

  getOnlineUsersList() {
    return Array.from(this.onlineUsers.entries()).map(([userId, info]) => ({
      userId,
      username: info.username,
      role: info.role
    }));
  }
}

module.exports = new SocketService();