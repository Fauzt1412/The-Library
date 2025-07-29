// Cloudinary setup helper script
const fs = require('fs');
const path = require('path');

console.log('🌤️ Cloudinary Setup Helper\n');

// Check if packages are installed
console.log('📦 Checking required packages...');
try {
  const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = [
    'cloudinary-react',
    '@cloudinary/react', 
    '@cloudinary/url-gen'
  ];
  
  const missingPackages = requiredPackages.filter(pkg => !dependencies[pkg]);
  
  if (missingPackages.length === 0) {
    console.log('✅ All required packages are installed');
  } else {
    console.log('❌ Missing packages:', missingPackages.join(', '));
    console.log('\n💡 Install missing packages:');
    console.log(`cd frontend && npm install ${missingPackages.join(' ')}`);
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check environment variables
console.log('\n🔧 Checking environment configuration...');
const envPath = 'frontend/.env.local';
let envExists = false;
let hasCloudinaryVars = false;

try {
  if (fs.existsSync(envPath)) {
    envExists = true;
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const requiredVars = [
      'REACT_APP_CLOUDINARY_CLOUD_NAME',
      'REACT_APP_CLOUDINARY_UPLOAD_PRESET'
    ];
    
    const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
    
    if (missingVars.length === 0) {
      hasCloudinaryVars = true;
      console.log('✅ Environment variables are configured');
    } else {
      console.log('❌ Missing environment variables:', missingVars.join(', '));
    }
  } else {
    console.log('❌ .env.local file not found');
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
}

// Create sample .env.local if needed
if (!envExists || !hasCloudinaryVars) {
  console.log('\n📝 Creating sample environment file...');
  
  const sampleEnv = `# Cloudinary Configuration
# Get these values from: https://cloudinary.com/console
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here

# Optional: API Key (for advanced features)
REACT_APP_CLOUDINARY_API_KEY=your_api_key_here

# Existing configuration
REACT_APP_API_URL=http://localhost:1412
`;

  try {
    fs.writeFileSync('frontend/.env.local.sample', sampleEnv);
    console.log('✅ Created frontend/.env.local.sample');
    console.log('💡 Copy to .env.local and add your actual Cloudinary credentials');
  } catch (error) {
    console.log('❌ Error creating sample env file:', error.message);
  }
}

// Check if utility files exist
console.log('\n📋 Checking utility files...');
const utilityFiles = [
  'frontend/src/utils/cloudinaryUtils.js',
  'frontend/src/utils/placeholderUtils.js',
  'frontend/src/components/CloudinaryFileUpload.js'
];

utilityFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${path.basename(filePath)} exists`);
  } else {
    console.log(`❌ ${path.basename(filePath)} missing`);
  }
});

console.log('\n🎯 Cloudinary Setup Steps:');
console.log('');
console.log('1. 📝 Create Cloudinary Account:');
console.log('   - Go to https://cloudinary.com');
console.log('   - Sign up for free account');
console.log('   - Note your Cloud Name from dashboard');
console.log('');
console.log('2. ⚙️ Create Upload Preset:');
console.log('   - Go to Settings → Upload');
console.log('   - Click "Add upload preset"');
console.log('   - Name: library-uploads');
console.log('   - Signing mode: Unsigned');
console.log('   - Save preset');
console.log('');
console.log('3. 🔧 Install Packages (if missing):');
console.log('   cd frontend');
console.log('   npm install cloudinary-react @cloudinary/react @cloudinary/url-gen');
console.log('');
console.log('4. 📝 Configure Environment:');
console.log('   - Copy .env.local.sample to .env.local');
console.log('   - Add your Cloud Name and Upload Preset');
console.log('');
console.log('5. 🚀 Update Components:');
console.log('   - Replace FileUpload with CloudinaryFileUpload');
console.log('   - Enable Cloudinary in your forms');
console.log('');
console.log('6. 🧪 Test Upload:');
console.log('   - Start dev server: npm start');
console.log('   - Try uploading an image');
console.log('   - Check Cloudinary dashboard for uploads');

console.log('\n💡 Benefits of Cloudinary:');
console.log('   ✅ Automatic image optimization');
console.log('   ✅ Global CDN delivery');
console.log('   ✅ Real-time transformations');
console.log('   ✅ 25GB free storage');
console.log('   ✅ Advanced AI features');

console.log('\n🔗 Helpful Links:');
console.log('   📖 Setup Guide: CLOUDINARY_SETUP.md');
console.log('   🌐 Cloudinary Console: https://cloudinary.com/console');
console.log('   📚 Documentation: https://cloudinary.com/documentation');

console.log('\n🎉 Ready to upgrade your image handling with Cloudinary!');