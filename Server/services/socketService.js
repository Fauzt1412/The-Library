const { Server } = require('socket.io');
const ChatMessage = require('../API/models/chat');
const User = require('../API/models/users');

class SocketService {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map(); // Users who joined chat
    this.userSockets = new Map(); // Socket ID to User ID mapping
    this.connectedUsers = new Map(); // All connected users (including those who haven't joined chat)
    this.socketToUser = new Map(); // Socket ID to user info mapping
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https://the-library-seven.vercel.app',
          'https://the-library-a11t.onrender.com',
          process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    this.setupEventHandlers();
    console.log('🔌 Socket.IO initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 User connected: ${socket.id}`);

      // Handle user presence registration (for seeing online users without joining chat)
      socket.on('register-presence', async (data) => {
        try {
          const { userId, username } = data;
          
          if (!userId || !username) {
            socket.emit('error', { message: 'Invalid user data for presence' });
            return;
          }

          const user = await User.findById(userId).select('username role');
          if (!user) {
            socket.emit('error', { message: 'User not found for presence' });
            return;
          }

          // Track connected user (not necessarily in chat)
          this.connectedUsers.set(userId, {
            socketId: socket.id,
            username: user.username,
            role: user.role || 'user',
            isInChat: false
          });
          this.socketToUser.set(socket.id, { userId, username: user.username, role: user.role || 'user' });

          // Broadcast updated presence to ALL connected sockets
          this.broadcastPresenceUpdate();

          console.log(`✅ User ${user.username} registered presence`);
        } catch (error) {
          console.error('Error in register-presence:', error);
          socket.emit('error', { message: 'Failed to register presence' });
        }
      });

      // Handle request for current online users
      socket.on('get-online-users', () => {
        const allOnlineUsers = this.getAllOnlineUsers();
        socket.emit('online-users-list', {
          count: allOnlineUsers.length,
          users: allOnlineUsers
        });
      });

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

          // Update existing connected user to be in chat
          if (this.connectedUsers.has(userId)) {
            const userInfo = this.connectedUsers.get(userId);
            userInfo.isInChat = true;
            this.connectedUsers.set(userId, userInfo);
          } else {
            // Add to connected users if not already there
            this.connectedUsers.set(userId, {
              socketId: socket.id,
              username: user.username,
              role: user.role || 'user',
              isInChat: true
            });
            this.socketToUser.set(socket.id, { userId, username: user.username, role: user.role || 'user' });
          }

          // Add user to chat room tracking FIRST
          this.onlineUsers.set(userId, {
            socketId: socket.id,
            username: user.username,
            role: user.role || 'user'
          });
          this.userSockets.set(socket.id, userId);

          // Join chat room and wait for it to complete
          await new Promise((resolve) => {
            socket.join('chat-room', () => {
              console.log(`🏠 User ${user.username} successfully joined chat-room`);
              resolve();
            });
          });

          const recentMessages = await ChatMessage.getRecentMessages(50);
          socket.emit('recent-messages', recentMessages.reverse());

          // Emit to all users in chat room, including the user who just joined
          this.io.to('chat-room').emit('user-joined', {
            userId,
            username: user.username,
            timestamp: new Date()
          });

          // Broadcast updated chat users list to ALL users (including the one who just joined)
          this.broadcastOnlineUsers();
          this.broadcastPresenceUpdate();

          // Debug: Check final state
          console.log(`✅ User ${user.username} joined chat`);
          console.log(`📊 Chat room now has ${this.onlineUsers.size} users:`, Array.from(this.onlineUsers.values()).map(u => u.username));
          console.log(`🔗 Socket mappings:`, Array.from(this.userSockets.entries()).map(([socketId, userId]) => ({ socketId: socketId.substring(0, 8), userId })));
        } catch (error) {
          console.error('Error in join-chat:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      socket.on('send-message', async (data) => {
        try {
          // First check if user is in chat room (preferred)
          let userId = this.userSockets.get(socket.id);
          
          // If not in chat room, check if they're at least connected with presence
          if (!userId) {
            const userInfo = this.socketToUser.get(socket.id);
            if (userInfo && userInfo.userId) {
              userId = userInfo.userId;
              console.log(`⚠️ User ${userInfo.username} sending message without joining chat room - auto-joining`);
              
              // Auto-join them to chat room
              const user = await User.findById(userId).select('username role');
              if (user) {
                // Add to chat room
                this.onlineUsers.set(userId, {
                  socketId: socket.id,
                  username: user.username,
                  role: user.role || 'user'
                });
                this.userSockets.set(socket.id, userId);
                socket.join('chat-room');
                
                // Update connected user status
                if (this.connectedUsers.has(userId)) {
                  const userInfo = this.connectedUsers.get(userId);
                  userInfo.isInChat = true;
                  this.connectedUsers.set(userId, userInfo);
                }
                
                console.log(`✅ Auto-joined ${user.username} to chat room`);
              }
            }
          }
          
          // Final check - if still no userId, then truly not authenticated
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

          // Get list of users in chat room for debugging
          const chatRoomSockets = await this.io.in('chat-room').fetchSockets();
          console.log(`📢 Sending message to chat-room with ${chatRoomSockets.length} sockets`);
          console.log(`📢 Message type: ${finalMessageType}, isNotice: ${savedMessage.isNotice}`);
          
          this.io.to('chat-room').emit('new-message', savedMessage);

          console.log(`💬 Message from ${user.username}: ${message.substring(0, 50)}...`);
        } catch (error) {
          console.error('Error in send-message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      socket.on('delete-message', async (data) => {
        try {
          // Check if user is authenticated (either in chat or has presence)
          let userId = this.userSockets.get(socket.id);
          if (!userId) {
            const userInfo = this.socketToUser.get(socket.id);
            if (userInfo && userInfo.userId) {
              userId = userInfo.userId;
            }
          }
          
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
          // Check if user is authenticated (either in chat or has presence)
          let userId = this.userSockets.get(socket.id);
          if (!userId) {
            const userInfo = this.socketToUser.get(socket.id);
            if (userInfo && userInfo.userId) {
              userId = userInfo.userId;
            }
          }
          
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
          // Check if user is authenticated (either in chat or has presence)
          let userId = this.userSockets.get(socket.id);
          if (!userId) {
            const userInfo = this.socketToUser.get(socket.id);
            if (userInfo && userInfo.userId) {
              userId = userInfo.userId;
            }
          }
          
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
          
          // Remove user from chat room but keep socket connection and presence
          socket.leave('chat-room');
          this.onlineUsers.delete(userId);
          this.userSockets.delete(socket.id);

          // Update connected user status (still connected, just not in chat)
          if (this.connectedUsers.has(userId)) {
            const userInfo = this.connectedUsers.get(userId);
            userInfo.isInChat = false;
            this.connectedUsers.set(userId, userInfo);
          }

          if (userInfo) {
            // Emit to all users in chat room
            this.io.to('chat-room').emit('user-left', {
              userId,
              username: userInfo.username,
              timestamp: new Date()
            });
          }

          // Broadcast to both chat room and all connected users
          this.broadcastOnlineUsers();
          this.broadcastPresenceUpdate();

          console.log(`👋 User ${userInfo?.username || username} left chat (connection maintained)`);
        } catch (error) {
          console.error('Error in leave-chat:', error);
          socket.emit('error', { message: 'Failed to leave chat' });
        }
      });

      socket.on('disconnect', () => {
        const userId = this.userSockets.get(socket.id);
        const userInfo = this.socketToUser.get(socket.id);
        
        // Clean up all user tracking
        if (userId) {
          const chatUserInfo = this.onlineUsers.get(userId);
          
          this.onlineUsers.delete(userId);
          this.userSockets.delete(socket.id);

          if (chatUserInfo) {
            // Emit to all users in chat room
            this.io.to('chat-room').emit('user-left', {
              userId,
              username: chatUserInfo.username,
              timestamp: new Date()
            });
          }
        }

        // Clean up presence tracking
        if (userInfo) {
          this.connectedUsers.delete(userInfo.userId);
          this.socketToUser.delete(socket.id);
        }

        // Broadcast updates to both chat and presence
        this.broadcastOnlineUsers();
        this.broadcastPresenceUpdate();

        console.log(`👋 User ${userInfo?.username || 'unknown'} disconnected completely`);
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

    console.log(`📢 Broadcasting chat users:`, onlineUsersArray.length, 'users:', onlineUsersArray.map(u => u.username));

    // Broadcast to ALL connected sockets
    this.io.emit('online-users-updated', {
      count: onlineUsersArray.length,
      users: onlineUsersArray
    });
  }

  broadcastPresenceUpdate() {
    const allOnlineUsers = this.getAllOnlineUsers();
    
    // Broadcast to ALL connected sockets, not just chat-room
    this.io.emit('presence-updated', {
      count: allOnlineUsers.length,
      users: allOnlineUsers
    });
  }

  getAllOnlineUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, info]) => ({
      userId,
      username: info.username,
      role: info.role,
      isInChat: info.isInChat
    }));
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

  getAllConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  getAllConnectedUsersList() {
    return this.getAllOnlineUsers();
  }
}

module.exports = new SocketService();