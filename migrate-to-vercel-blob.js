// Migration script to help transition to Vercel Blob
const fs = require('fs');
const path = require('path');

console.log('🔄 Vercel Blob Migration Helper\n');

// Step 1: Check current setup
console.log('📋 Step 1: Checking current setup...');

const checkFile = (filePath, description) => {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${description} exists`);
      return true;
    } else {
      console.log(`❌ ${description} missing`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error checking ${description}:`, error.message);
    return false;
  }
};

const requiredFiles = [
  { path: 'frontend/package.json', desc: 'Frontend package.json' },
  { path: 'frontend/src/components/FileUpload.js', desc: 'FileUpload component' },
  { path: 'frontend/src/services/api.js', desc: 'API service' },
  { path: 'frontend/src/utils/imageUtils.js', desc: 'Image utilities' }
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (!checkFile(file.path, file.desc)) {
    allFilesExist = false;
  }
});

console.log('');

// Step 2: Check if Vercel Blob is installed
console.log('📋 Step 2: Checking Vercel Blob installation...');
try {
  const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  if (packageJson.dependencies && packageJson.dependencies['@vercel/blob']) {
    console.log('✅ @vercel/blob is already installed');
  } else {
    console.log('❌ @vercel/blob is not installed');
    console.log('💡 Run: cd frontend && npm install @vercel/blob');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('');

// Step 3: Check environment variables
console.log('📋 Step 3: Checking environment setup...');
const envFiles = [
  'frontend/.env.local',
  'frontend/.env',
  '.env'
];

let envFileExists = false;
envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    console.log(`✅ Found ${envFile}`);
    envFileExists = true;
    
    try {
      const content = fs.readFileSync(envFile, 'utf8');
      if (content.includes('BLOB_READ_WRITE_TOKEN')) {
        console.log('✅ BLOB_READ_WRITE_TOKEN found');
      } else {
        console.log('❌ BLOB_READ_WRITE_TOKEN missing');
      }
    } catch (error) {
      console.log(`❌ Error reading ${envFile}:`, error.message);
    }
  }
});

if (!envFileExists) {
  console.log('❌ No environment files found');
  console.log('💡 Create frontend/.env.local with your Vercel Blob token');
}

console.log('');

// Step 4: Migration checklist
console.log('📋 Step 4: Migration Checklist');
console.log('');
console.log('🔧 To complete Vercel Blob setup:');
console.log('');
console.log('1. Install Vercel Blob:');
console.log('   cd frontend && npm install @vercel/blob');
console.log('');
console.log('2. Get your Vercel Blob token:');
console.log('   - Go to https://vercel.com/dashboard');
console.log('   - Navigate to Storage > Blob');
console.log('   - Create a new store or use existing');
console.log('   - Copy the read/write token');
console.log('');
console.log('3. Add to frontend/.env.local:');
console.log('   BLOB_READ_WRITE_TOKEN=your_token_here');
console.log('   NEXT_PUBLIC_BLOB_STORE_ID=your_store_id_here');
console.log('');
console.log('4. Create blob utilities:');
console.log('   - Copy the blobUtils.js code from VERCEL_BLOB_SETUP.md');
console.log('   - Save as frontend/src/utils/blobUtils.js');
console.log('');
console.log('5. Update FileUpload component:');
console.log('   - Replace with the new blob-enabled version');
console.log('   - Test image uploads');
console.log('');
console.log('6. Update API service:');
console.log('   - Add blob URL handling');
console.log('   - Update create/update methods');
console.log('');
console.log('7. Update backend:');
console.log('   - Handle blob URLs in routes');
console.log('   - Update database schema if needed');
console.log('');
console.log('8. Test everything:');
console.log('   - Upload new images');
console.log('   - Verify display in all sections');
console.log('   - Check favorites section specifically');
console.log('');

// Step 5: Create sample files
console.log('📋 Step 5: Creating sample files...');

// Create sample .env.local
const sampleEnv = `# Vercel Blob Configuration
BLOB_READ_WRITE_TOKEN=your_blob_token_here
NEXT_PUBLIC_BLOB_STORE_ID=your_store_id_here

# Existing configuration
REACT_APP_API_URL=http://localhost:1412
`;

try {
  if (!fs.existsSync('frontend/.env.local')) {
    fs.writeFileSync('frontend/.env.local.sample', sampleEnv);
    console.log('✅ Created frontend/.env.local.sample');
    console.log('💡 Rename to .env.local and add your actual tokens');
  } else {
    console.log('✅ frontend/.env.local already exists');
  }
} catch (error) {
  console.log('❌ Error creating sample env file:', error.message);
}

console.log('');

// Summary
console.log('📊 Migration Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('🚀 Ready to proceed with Vercel Blob setup');
  console.log('📖 Follow the detailed guide in VERCEL_BLOB_SETUP.md');
} else {
  console.log('❌ Some required files are missing');
  console.log('🔧 Please ensure all files exist before proceeding');
}

console.log('');
console.log('🎯 Next Steps:');
console.log('1. Read VERCEL_BLOB_SETUP.md for detailed instructions');
console.log('2. Install @vercel/blob package');
console.log('3. Set up environment variables');
console.log('4. Create blob utilities');
console.log('5. Update components and API');
console.log('6. Test thoroughly');
console.log('');
console.log('💡 Need help? Check the troubleshooting section in the setup guide!');