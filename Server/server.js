const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 1412;
const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/Storage_database_SYS';

// Initialize Socket.IO service
const socketService = require('./services/socketService');
socketService.initialize(server);

console.log(`🚀 Starting server on port ${port}`);
console.log(`📊 Database URL: ${databaseURL}`);

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://the-library-seven.vercel.app', // Your actual Vercel URL
    'https://the-library-a11t.onrender.com', // Your Render backend URL
    process.env.FRONTEND_URL // Additional frontend URL from environment
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

console.log('🌐 CORS configured for origins:', allowedOrigins);

// Use built-in Express body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        port: port,
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API health check
app.get('/API/health', (req, res) => {
    res.json({ 
        status: 'API OK', 
        timestamp: new Date().toISOString(),
        endpoints: {
            books: '/API/books',
            games: '/API/games',
            login: '/API/login',
            signup: '/API/signup',
            favorites: '/API/favorites',
            user: '/API/user',
            chat: '/API/chat'
        }
    });
});

// DIRECT BYPASS: Online users endpoint (completely public, no middleware)
app.get('/API/chat/online-direct', (req, res) => {
    try {
        console.log('🔥 [DIRECT BYPASS] Online users endpoint hit');
        console.log('🔥 [DIRECT BYPASS] Method:', req.method);
        console.log('🔥 [DIRECT BYPASS] Headers:', req.headers);
        
        // Try to get socket service
        const socketService = require('./services/socketService');
        
        if (!socketService) {
            console.log('🔥 [DIRECT BYPASS] Socket service not available');
            return res.json({
                success: true,
                message: 'Direct bypass endpoint working, but socket service not available',
                connected: { count: 0, users: [] },
                inChat: { count: 0, users: [] },
                onlineCount: 0,
                users: [],
                timestamp: new Date().toISOString(),
                endpoint: 'DIRECT BYPASS'
            });
        }
        
        // Get online users from socket service
        const allConnectedUsers = socketService.getAllConnectedUsersList();
        const connectedCount = socketService.getAllConnectedUsersCount();
        const chatUsers = socketService.getOnlineUsersList();
        const chatCount = socketService.getOnlineUsersCount();
        
        console.log(`🔥 [DIRECT BYPASS] Returning ${connectedCount} connected, ${chatCount} in chat`);
        
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
            onlineCount: connectedCount,
            users: allConnectedUsers,
            timestamp: new Date().toISOString(),
            endpoint: 'DIRECT BYPASS - NO MIDDLEWARE'
        };
        
        console.log('🔥 [DIRECT BYPASS] Sending response:', JSON.stringify(response, null, 2));
        res.status(200).json(response);
        
    } catch (error) {
        console.error('🔥 [DIRECT BYPASS] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Direct bypass endpoint error',
            error: error.message,
            connected: { count: 0, users: [] },
            inChat: { count: 0, users: [] },
            onlineCount: 0,
            users: [],
            timestamp: new Date().toISOString(),
            endpoint: 'DIRECT BYPASS - ERROR'
        });
    }
});

// Serve static files from uploads directory
// Use persistent disk path in production, local path in development
const uploadsPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/uploads' 
    : path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadsPath));
console.log('📁 Serving static files from:', uploadsPath);

// Connect to MongoDB
mongoose.connect(databaseURL)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Import and use routes
console.log('📋 Setting up routes...');

const AuthenticationRoute = require('./API/routes/AURoute');
app.use('/API', AuthenticationRoute);
console.log('✅ Authentication routes loaded');

const BookRoute = require('./API/routes/BookRoute');
app.use('/API', BookRoute);
console.log('✅ Book routes loaded');

const GameRoute = require('./API/routes/GameRoute');
app.use('/API', GameRoute);
console.log('✅ Game routes loaded');

const NotificationRoute = require('./API/routes/NotificationRoute');
app.use('/API', NotificationRoute);
console.log('✅ Notification routes loaded');

const SubmissionRoute = require('./API/routes/SubmissionRoute');
app.use('/API', SubmissionRoute);
console.log('✅ Submission routes loaded');

const EditRequestRoute = require('./API/routes/EditRequestRoute');
app.use('/API', EditRequestRoute);
console.log('✅ Edit request routes loaded');

const favoriteRoutes = require('./API/routes/FavoriteRoute');
app.use('/API', favoriteRoutes);
console.log('✅ Favorite routes loaded');

const userRoutes = require('./API/routes/UserRoute');
app.use('/API', userRoutes);
console.log('✅ User routes loaded');

const chatRoutes = require('./API/routes/ChatRoute');
app.use('/API', chatRoutes);
console.log('✅ Chat routes loaded');

console.log('🎯 All routes configured successfully');

server.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log('🔌 Socket.IO enabled for real-time chat');
    console.log('📋 Available endpoints:');
    console.log('   - POST /API/login');
    console.log('   - POST /API/signup');
    console.log('   - GET  /API/favorites');
    console.log('   - GET  /API/user/profile');
    console.log('   - GET  /API/health');
    console.log('   - GET  /API/chat/messages');
    console.log('   - POST /API/chat/messages');
    console.log('   - WebSocket: Real-time chat');
});