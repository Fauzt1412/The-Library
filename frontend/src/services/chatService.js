import { io } from 'socket.io-client';
import axios from 'axios';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUser = null;
    this.eventListeners = new Map();
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:1412';
  }

  connect(user) {
    if (this.socket) {
      this.disconnect();
    }

    this.currentUser = user;
    this.socket = io(this.baseURL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUser = null;
    }
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('🔌 Connected to chat server');
      this.isConnected = true;
      
      if (this.currentUser) {
        this.socket.emit('join-chat', {
          userId: this.currentUser.id,
          username: this.currentUser.username
        });
      }

      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from chat server');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.emit('connection-error', error);
    });

    this.socket.on('recent-messages', (messages) => {
      this.emit('recent-messages', messages);
    });

    this.socket.on('new-message', (message) => {
      this.emit('new-message', message);
    });

    this.socket.on('message-deleted', (data) => {
      this.emit('message-deleted', data);
    });

    this.socket.on('user-joined', (data) => {
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      this.emit('user-left', data);
    });

    this.socket.on('online-users-updated', (data) => {
      this.emit('online-users-updated', data);
    });

    this.socket.on('user-typing', (data) => {
      this.emit('user-typing', data);
    });

    this.socket.on('user-stop-typing', (data) => {
      this.emit('user-stop-typing', data);
    });

    this.socket.on('chat-cleared', () => {
      this.emit('chat-cleared');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Chat error:', error);
      this.emit('error', error);
    });
  }

  sendMessage(message, messageType = 'user', isNotice = false) {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to chat server');
    }

    this.socket.emit('send-message', {
      message,
      messageType,
      isNotice
    });
  }

  deleteMessage(messageId) {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to chat server');
    }

    this.socket.emit('delete-message', { messageId });
  }

  startTyping() {
    if (this.isConnected && this.socket) {
      this.socket.emit('typing-start');
    }
  }

  stopTyping() {
    if (this.isConnected && this.socket) {
      this.socket.emit('typing-stop');
    }
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  async getMessages(page = 1, limit = 50) {
    try {
      const userId = this.currentUser?.id;
      const response = await axios.get(`${this.baseURL}/API/chat/messages`, {
        params: { page, limit },
        headers: userId ? { 'x-user-id': userId } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessageHTTP(message, messageType = 'user', isNotice = false) {
    try {
      const userId = this.currentUser?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await axios.post(`${this.baseURL}/API/chat/messages`, {
        message,
        messageType,
        isNotice
      }, {
        headers: { 'x-user-id': userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async deleteMessageHTTP(messageId) {
    try {
      const userId = this.currentUser?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await axios.delete(`${this.baseURL}/API/chat/messages/${messageId}`, {
        headers: { 'x-user-id': userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  isUserConnected() {
    return this.isConnected;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getSocket() {
    return this.socket;
  }
}

export default new ChatService();