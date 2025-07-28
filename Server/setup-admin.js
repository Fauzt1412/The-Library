const mongoose = require('mongoose');
const User = require('./API/models/users');
require('dotenv').config();

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/Storage_database_SYS';

async function createAdminAccount() {
    try {
        // Connect to MongoDB
        await mongoose.connect(databaseURL);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'Fau' });
        if (existingAdmin) {
            console.log('Admin account "Fau" already exists');
            return;
        }

        // Create admin account
        const adminUser = new User({
            username: 'Fau',
            password: '123456',
            email: 'fau@admin.com',
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin account created successfully!');
        console.log('Username: Fau');
        console.log('Password: 123456');
        console.log('Role: admin');

    } catch (error) {
        console.error('Error creating admin account:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createAdminAccount();