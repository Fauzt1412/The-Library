// Script to help you get Vercel Blob information
console.log('🔍 Getting Vercel Blob Store Information\n');

console.log('📋 Step-by-Step Guide to Get Your Blob Store ID:\n');

console.log('1. 🌐 Go to Vercel Dashboard:');
console.log('   https://vercel.com/dashboard\n');

console.log('2. 📁 Navigate to your project or create one:');
console.log('   - Click on your project name');
console.log('   - Or click "Add New..." → "Project" if you need to create one\n');

console.log('3. 💾 Go to Storage section:');
console.log('   - Click on the "Storage" tab');
console.log('   - Click on "Blob"\n');

console.log('4. 🗃️ Create or select Blob store:');
console.log('   - If no store exists: Click "Create Database" → "Blob"');
console.log('   - Name it something like "library-images"');
console.log('   - Choose your preferred region');
console.log('   - Click "Create"\n');

console.log('5. ⚙️ Get your credentials:');
console.log('   - Click on your blob store name');
console.log('   - Go to "Settings" tab');
console.log('   - Copy the "Store ID" (this is NEXT_PUBLIC_BLOB_STORE_ID)');
console.log('   - Copy the "Read/Write Token" (this is BLOB_READ_WRITE_TOKEN)\n');

console.log('6. 📝 Add to your .env.local file:');
console.log('   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx');
console.log('   NEXT_PUBLIC_BLOB_STORE_ID=store_xxxxxxxxxx\n');

console.log('🔧 Alternative: Using Vercel CLI');
console.log('   1. Install: npm i -g vercel');
console.log('   2. Login: vercel login');
console.log('   3. Link project: vercel link');
console.log('   4. List storage: vercel env ls\n');

console.log('💡 Tips:');
console.log('   - Store ID usually starts with "store_"');
console.log('   - Token usually starts with "vercel_blob_rw_"');
console.log('   - Keep these credentials secure');
console.log('   - Add .env.local to your .gitignore\n');

console.log('🎯 What each variable does:');
console.log('   BLOB_READ_WRITE_TOKEN: Authenticates your app with Vercel Blob');
console.log('   NEXT_PUBLIC_BLOB_STORE_ID: Identifies which blob store to use\n');

console.log('✅ Once you have both values, update your frontend/.env.local file');
console.log('🚀 Then you can start using Vercel Blob for image storage!');