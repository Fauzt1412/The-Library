const axios = require('axios');

// Test script to verify reading links functionality
const BASE_URL = 'http://localhost:1412';

async function testReadingLinks() {
    try {
        console.log('Testing Reading Links Functionality...');
        
        // First, get all books to see if any have reading links
        console.log('\nFetching all books...');
        const booksResponse = await axios.get(`${BASE_URL}/api/books`);
        
        if (booksResponse.data && booksResponse.data.data) {
            const books = booksResponse.data.data;
            console.log(`Found ${books.length} books`);
            
            // Check each book for reading links
            books.forEach((book, index) => {
                console.log(`\nBook ${index + 1}: "${book.title}" by ${book.author}`);
                console.log(`  ID: ${book._id}`);
                console.log(`  Reading Links: ${book.readingLinks ? book.readingLinks.length : 0}`);
                
                if (book.readingLinks && book.readingLinks.length > 0) {
                    book.readingLinks.forEach((link, linkIndex) => {
                        console.log(`    ${linkIndex + 1}. ${link.name}: ${link.url}`);
                    });
                } else {
                    console.log('    No custom reading links found');
                }
            });
            
            // Test fetching a specific book
            if (books.length > 0) {
                const firstBook = books[0];
                console.log(`\nTesting individual book fetch for: "${firstBook.title}"`);
                
                const bookDetailResponse = await axios.get(`${BASE_URL}/api/books/${firstBook._id}`);
                
                if (bookDetailResponse.data && bookDetailResponse.data.data) {
                    const bookDetail = bookDetailResponse.data.data;
                    console.log('Book detail fetched successfully');
                    console.log(`   Title: ${bookDetail.title}`);
                    console.log(`   Reading Links: ${bookDetail.readingLinks ? bookDetail.readingLinks.length : 0}`);
                    
                    if (bookDetail.readingLinks && bookDetail.readingLinks.length > 0) {
                        console.log('   Custom Reading Links:');
                        bookDetail.readingLinks.forEach((link, index) => {
                            console.log(`     ${index + 1}. ${link.name}: ${link.url}`);
                        });
                    }
                } else {
                    console.log('Failed to fetch book detail');
                }
            }
        } else {
            console.log('No books found or invalid response format');
        }
        
        console.log('\nReading Links test completed!');
        
    } catch (error) {
        console.error('Error testing reading links:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\nMake sure the server is running on http://localhost:1412');
            console.log('You can start it with: cd Server && npm start');
        }
    }
}

// Run the test
testReadingLinks();