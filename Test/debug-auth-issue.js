const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/library-games-store');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// User model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const debugAuthIssue = async () => {
    console.log('🔍 Debugging Authentication Issue...');
    console.log('=' .repeat(50));
    
    await connectDB();
    
    try {
        // Get all users
        const users = await User.find({}).select('username email password role');
        
        console.log(`\\n📊 Found ${users.length} users in database:`);
        
        for (let user of users) {
            console.log(`\\n👤 User: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password length: ${user.password.length}`);
            
            // Check if password is hashed (bcrypt hashes are 60 characters long)
            const isHashed = user.password.length === 60 && user.password.startsWith('$2');
            console.log(`   Password hashed: ${isHashed ? '✅' : '❌'}`);
            
            if (!isHashed) {
                console.log(`   ⚠️  Password appears to be plain text!`);
                
                // Hash the plain text password
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await User.findByIdAndUpdate(user._id, { password: hashedPassword });
                console.log(`   ✅ Password has been hashed and updated`);
            }
        }
        
        console.log('\\n🔧 TESTING LOGIN PROCESS:');
        
        if (users.length > 0) {
            const testUser = users[0];
            console.log(`\\n🧪 Testing login for user: ${testUser.username}`);
            
            // Test password comparison
            const testPassword = 'password'; // Common test password
            const isValid = await bcrypt.compare(testPassword, testUser.password);
            console.log(`   Password 'password' valid: ${isValid ? '✅' : '❌'}`);
            
            // Test with username as password (common in development)
            const isUsernameValid = await bcrypt.compare(testUser.username, testUser.password);
            console.log(`   Username as password valid: ${isUsernameValid ? '✅' : '❌'}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\\n👋 Database connection closed');
    }
};

// Run the debug
debugAuthIssue();