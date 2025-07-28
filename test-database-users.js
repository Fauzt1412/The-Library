const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Storage_database_SYS');
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
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const testDatabaseUsers = async () => {
    console.log('🔍 Testing Database Users...');
    console.log('=' .repeat(50));
    
    await connectDB();
    
    try {
        // Get all users
        const users = await User.find({}).select('username email password role createdAt');
        
        console.log(`\\n📊 Found ${users.length} users in database:`);
        
        if (users.length === 0) {
            console.log('❌ No users found in database!');
            console.log('\\n🔧 Creating a test admin user...');
            
            const testUser = new User({
                username: 'admin',
                email: 'admin@test.com',
                password: 'admin',
                role: 'admin'
            });
            
            await testUser.save();
            console.log('✅ Test admin user created');
            console.log('   Username: admin');
            console.log('   Password: admin');
            console.log('   Role: admin');
        } else {
            for (let user of users) {
                console.log(`\\n👤 User: ${user.username}`);
                console.log(`   ID: ${user._id}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Password: ${user.password}`);
                console.log(`   Created: ${user.createdAt}`);
                
                // Test if this user can be found by ID
                const foundUser = await User.findById(user._id);
                console.log(`   Can find by ID: ${foundUser ? '✅' : '❌'}`);
            }
        }
        
        console.log('\\n🧪 Testing Authentication Logic...');
        
        // Test finding user by username and password
        const testLogin = await User.findOne({ username: 'admin', password: 'admin' });
        console.log(`\\nLogin test (admin/admin): ${testLogin ? '✅ Success' : '❌ Failed'}`);
        
        if (testLogin) {
            console.log(`   Found user: ${testLogin.username} (${testLogin._id})`);
            
            // Test finding by ID (what auth middleware does)
            const foundById = await User.findById(testLogin._id);
            console.log(`   Find by ID test: ${foundById ? '✅ Success' : '❌ Failed'}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\\n👋 Database connection closed');
    }
};

// Run the test
testDatabaseUsers();