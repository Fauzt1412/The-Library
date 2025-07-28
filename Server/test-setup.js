// Simple test to verify the setup works
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Test mongoose connection
const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/Storage_database_SYS';
console.log('Database URL:', databaseURL);

mongoose.connect(databaseURL)
    .then(() => {
        console.log('✅ MongoDB connection successful');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
    });