const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 1412;
const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/Storage_database_SYS';

console.log(`🚀 Starting server on port ${port}`);
console.log(`📊 Database URL: ${databaseURL}`);

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL // This will be your Vercel URL
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
            user: '/API/user'
        }
    });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

console.log('🎯 All routes configured successfully');

app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log('📋 Available endpoints:');
    console.log('   - POST /API/login');
    console.log('   - POST /API/signup');
    console.log('   - GET  /API/favorites');
    console.log('   - GET  /API/user/profile');
    console.log('   - GET  /API/health');
});