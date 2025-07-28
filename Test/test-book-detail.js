const axios = require('axios');

const API_BASE = 'http://localhost:1412/API';

async function testBookDetail() {
    console.log('📚 Testing Book Detail Functionality...');
    console.log('=' .repeat(60));
    
    try {
        // 1. First get all books to find a valid book ID
        console.log('\n1. 📚 Getting all books to find a valid book ID...');
        try {
            const booksResponse = await axios.get(`${API_BASE}/books`);
            console.log('✅ Books API Response:', {
                status: booksResponse.status,
                dataType: typeof booksResponse.data,
                hasData: 'data' in booksResponse.data,
                isArray: Array.isArray(booksResponse.data.data),
                count: booksResponse.data.data?.length || 0
            });
            
            if (booksResponse.data.data && booksResponse.data.data.length > 0) {
                const firstBook = booksResponse.data.data[0];
                console.log('📚 Found first book:', {
                    id: firstBook._id,
                    title: firstBook.title,
                    author: firstBook.author
                });
                
                // 2. Test getting specific book details
                console.log(`\n2. 📖 Testing book detail for ID: ${firstBook._id}...`);
                try {
                    const bookDetailResponse = await axios.get(`${API_BASE}/books/${firstBook._id}`);
                    console.log('✅ Book Detail API Response:', {
                        status: bookDetailResponse.status,
                        dataType: typeof bookDetailResponse.data,
                        hasData: 'data' in bookDetailResponse.data,
                        bookId: bookDetailResponse.data.data?._id || bookDetailResponse.data._id,
                        bookTitle: bookDetailResponse.data.data?.title || bookDetailResponse.data.title
                    });
                    
                    const bookData = bookDetailResponse.data.data || bookDetailResponse.data;
                    console.log('📚 Book Detail Data:', {
                        id: bookData._id,
                        title: bookData.title,
                        author: bookData.author,
                        price: bookData.Prices,
                        description: bookData.description ? 'Has description' : 'No description',
                        coverImage: bookData.Coverpage ? 'Has cover image' : 'No cover image',
                        readingLinks: bookData.readingLinks ? `${bookData.readingLinks.length} links` : 'No reading links',
                        publishedBy: bookData.publishedBy ? 'Has publisher info' : 'No publisher info'
                    });
                    
                } catch (error) {
                    console.log('❌ Book Detail API Error:', {
                        status: error.response?.status,
                        message: error.message,
                        data: error.response?.data
                    });
                }
                
                // 3. Test with invalid book ID
                console.log('\n3. 🚫 Testing with invalid book ID (should return 404)...');
                try {
                    await axios.get(`${API_BASE}/books/invalid-book-id-123`);
                    console.log('⚠️ Unexpected: Invalid book ID worked');
                } catch (error) {
                    if (error.response?.status === 404) {
                        console.log('✅ Invalid book ID correctly returns 404');
                    } else {
                        console.log('❌ Unexpected error for invalid ID:', error.response?.status, error.response?.data);
                    }\n                }\n                \n            } else {\n                console.log('⚠️ No books found in database. Add some books first.');\n            }\n            \n        } catch (error) {\n            console.log('❌ Books API Error:', error.response?.status, error.response?.data);\n        }\n        \n        console.log('\\n' + '=' .repeat(60));\n        console.log('🎯 BOOK DETAIL TEST SUMMARY:');\n        \n        console.log('\\n✅ What should work:');\n        console.log('   - Book detail page with valid book ID');\n        console.log('   - Proper error handling for invalid IDs');\n        console.log('   - Display of book information, cover image, reading links');\n        \n        console.log('\\n🔧 Frontend Features:');\n        console.log('   - Enhanced error handling and logging');\n        console.log('   - Proper API response structure parsing');\n        console.log('   - Reading links display (if available)');\n        console.log('   - Publisher information display');\n        console.log('   - Share functionality');\n        console.log('   - Breadcrumb navigation');\n        \n        console.log('\\n💡 To test the frontend:');\n        console.log('   1. Start frontend: cd frontend && npm start');\n        console.log('   2. Navigate to a book detail page: /books/{book-id}');\n        console.log('   3. Check browser console for debug messages:');\n        console.log('      - 📚 Starting to fetch book details for ID: ...');\n        console.log('      - 📚 Book detail response: {...}');\n        console.log('      - 📚 Setting book data: {...}');\n        \n        console.log('\\n🚨 If book detail page shows errors:');\n        console.log('   1. Check if the book ID exists in the database');\n        console.log('   2. Verify server is running on port 1412');\n        console.log('   3. Check browser console for specific error messages');\n        console.log('   4. Try navigating from the books list page');\n        \n    } catch (error) {\n        console.error('❌ Test script failed:', error.message);\n    }\n}\n\ntestBookDetail();