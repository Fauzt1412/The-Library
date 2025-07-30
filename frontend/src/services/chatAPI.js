// Chat API service - This would normally connect to a real backend
// For now, it simulates API calls with local storage and mock data

const CHAT_STORAGE_KEY = 'library_chat_messages';
const USERS_STORAGE_KEY = 'library_chat_users';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const chatAPI = {
  // Get all messages
  async getMessages() {
    await delay(300);
    
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      const messages = stored ? JSON.parse(stored) : [];
      
      return {
        success: true,
        data: messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        error: 'Failed to fetch messages'
      };
    }
  },

  // Send a new message
  async sendMessage(messageData) {
    await delay(500);
    
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      const messages = stored ? JSON.parse(stored) : [];
      
      const newMessage = {
        id: Date.now(),
        ...messageData,
        timestamp: new Date().toISOString(),
        type: 'message'
      };
      
      messages.push(newMessage);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      
      return {
        success: true,
        data: {
          ...newMessage,
          timestamp: new Date(newMessage.timestamp)
        }
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: 'Failed to send message'
      };
    }
  },

  // Get online users
  async getOnlineUsers() {
    await delay(200);
    
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      const users = stored ? JSON.parse(stored) : [];
      
      return {
        success: true,
        data: users.map(user => ({
          ...user,
          lastSeen: new Date(user.lastSeen)
        }))
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: 'Failed to fetch users'
      };
    }
  },

  // Update user status
  async updateUserStatus(userId, status) {
    await delay(100);
    
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      const users = stored ? JSON.parse(stored) : [];
      
      const userIndex = users.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          status,
          lastSeen: new Date().toISOString()
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
      
      return {
        success: true,
        data: users[userIndex]
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      return {
        success: false,
        error: 'Failed to update user status'
      };
    }
  },

  // Delete a specific message (admin only)
  async deleteMessage(messageId) {
    await delay(200);
    
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      const messages = stored ? JSON.parse(stored) : [];
      
      const filteredMessages = messages.filter(msg => msg.id !== messageId);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(filteredMessages));
      
      return {
        success: true,
        message: 'Message deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting message:', error);
      return {
        success: false,
        error: 'Failed to delete message'
      };
    }
  },

  // Clear chat history (admin only)
  async clearMessages() {
    await delay(300);
    
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return {
        success: true,
        message: 'Chat history cleared'
      };
    } catch (error) {
      console.error('Error clearing messages:', error);
      return {
        success: false,
        error: 'Failed to clear messages'
      };
    }
  },

  // Get chat statistics
  async getChatStats() {
    await delay(200);
    
    try {
      const messagesStored = localStorage.getItem(CHAT_STORAGE_KEY);
      const usersStored = localStorage.getItem(USERS_STORAGE_KEY);
      
      const messages = messagesStored ? JSON.parse(messagesStored) : [];
      const users = usersStored ? JSON.parse(usersStored) : [];
      
      const onlineUsers = users.filter(user => user.status === 'online');
      const todayMessages = messages.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        const today = new Date();
        return msgDate.toDateString() === today.toDateString();
      });
      
      return {
        success: true,
        data: {
          totalMessages: messages.length,
          todayMessages: todayMessages.length,
          onlineUsers: onlineUsers.length,
          totalUsers: users.length
        }
      };
    } catch (error) {
      console.error('Error fetching chat stats:', error);
      return {
        success: false,
        error: 'Failed to fetch chat statistics'
      };
    }
  }
};

// Initialize sample data if not exists
export const initializeChatData = () => {
  const messagesStored = localStorage.getItem(CHAT_STORAGE_KEY);
  const usersStored = localStorage.getItem(USERS_STORAGE_KEY);
  
  if (!messagesStored) {
    const sampleMessages = [
      {
        id: 1,
        user: 'LibraryBot',
        message: '🎉 Welcome to the Library Forum! This is your space to discuss books, games, share recommendations, and connect with fellow enthusiasts.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isAdmin: true,
        type: 'system'
      },
      {
        id: 2,
        user: 'BookWorm92',
        message: 'Just finished reading "The Seven Husbands of Evelyn Hugo" and I\'m absolutely blown away! Anyone else read it?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isAdmin: false,
        type: 'message'
      },
      {
        id: 3,
        user: 'GameMaster',
        message: 'Has anyone tried the new Baldur\'s Gate 3? The character development is incredible!',
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        isAdmin: false,
        type: 'message'
      }
    ];
    
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sampleMessages));
  }
  
  if (!usersStored) {
    // Start with empty users list
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Auto-initialize when module loads
initializeChatData();