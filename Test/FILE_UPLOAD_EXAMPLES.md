# File Upload Examples

## Overview
The API now supports file uploads for book and game cover images. Users can upload image files (.png, .jpg, .jpeg, .gif, .webp) instead of providing URLs.

## Supported File Types
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

## File Size Limit
- Maximum file size: **5MB**

## Upload Endpoints

### 1. Publishing a Book with Cover Image

**Endpoint**: `POST /API/books`

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `userId` (text) - User ID for authentication
- `title` (text) - Book title
- `author` (text) - Author name
- `categories` (text) - Book categories
- `description` (text) - Book description
- `Prices` (text) - Book price
- `publishedDate` (text, optional) - Publication date
- `coverImage` (file) - Cover image file

**Example using curl**:
```bash
curl -X POST http://localhost:1412/API/books \
  -F "userId=USER_ID_HERE" \
  -F "title=My Amazing Book" \
  -F "author=John Doe" \
  -F "categories=Fiction" \
  -F "description=An amazing story about adventure" \
  -F "Prices=19.99" \
  -F "coverImage=@/path/to/your/book-cover.jpg"
```

**Example using JavaScript (FormData)**:
```javascript
const formData = new FormData();
formData.append('userId', 'USER_ID_HERE');
formData.append('title', 'My Amazing Book');
formData.append('author', 'John Doe');
formData.append('categories', 'Fiction');
formData.append('description', 'An amazing story about adventure');
formData.append('Prices', '19.99');
formData.append('coverImage', fileInput.files[0]); // File from input element

fetch('http://localhost:1412/API/books', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### 2. Publishing a Game with Cover Image

**Endpoint**: `POST /API/games`

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `userId` (text) - User ID for authentication
- `title` (text) - Game title
- `genre` (text) - Game genre
- `developer` (text) - Developer name
- `platform` (text) - Gaming platforms
- `releaseDate` (text) - Release date
- `description` (text) - Game description
- `price` (text) - Game price
- `coverImage` (file) - Cover image file

**Example using curl**:
```bash
curl -X POST http://localhost:1412/API/games \
  -F "userId=USER_ID_HERE" \
  -F "title=Epic Adventure Game" \
  -F "genre=Adventure" \
  -F "developer=John Doe Studios" \
  -F "platform=PC, PlayStation, Xbox" \
  -F "releaseDate=2024-12-01" \
  -F "description=An epic adventure game" \
  -F "price=49.99" \
  -F "coverImage=@/path/to/your/game-cover.png"
```

### 3. Updating Book with New Cover Image

**Endpoint**: `PUT /API/books/:id`

**Content-Type**: `multipart/form-data`

**Note**: Cover image is optional for updates. If not provided, the existing image will be kept.

**Example using curl**:
```bash
curl -X PUT http://localhost:1412/API/books/BOOK_ID_HERE \
  -F "userId=USER_ID_HERE" \
  -F "title=Updated Book Title" \
  -F "author=John Doe" \
  -F "categories=Fiction" \
  -F "description=Updated description" \
  -F "Prices=24.99" \
  -F "coverImage=@/path/to/new-cover.jpg"
```

### 4. Updating Game with New Cover Image

**Endpoint**: `PUT /API/games/:id`

**Content-Type**: `multipart/form-data`

**Example using curl**:
```bash
curl -X PUT http://localhost:1412/API/games/GAME_ID_HERE \
  -F "userId=USER_ID_HERE" \
  -F "title=Updated Game Title" \
  -F "genre=Adventure" \
  -F "developer=John Doe Studios" \
  -F "platform=PC, PlayStation, Xbox" \
  -F "releaseDate=2024-12-01" \
  -F "description=Updated description" \
  -F "price=54.99" \
  -F "coverImage=@/path/to/new-cover.png"
```

## HTML Form Examples

### Book Upload Form
```html
<form action="http://localhost:1412/API/books" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="userId" value="USER_ID_HERE">
    
    <label for="title">Title:</label>
    <input type="text" name="title" required>
    
    <label for="author">Author:</label>
    <input type="text" name="author" required>
    
    <label for="categories">Categories:</label>
    <input type="text" name="categories" required>
    
    <label for="description">Description:</label>
    <textarea name="description" required></textarea>
    
    <label for="Prices">Price:</label>
    <input type="number" name="Prices" step="0.01" required>
    
    <label for="coverImage">Cover Image:</label>
    <input type="file" name="coverImage" accept="image/*" required>
    
    <button type="submit">Publish Book</button>
</form>
```

### Game Upload Form
```html
<form action="http://localhost:1412/API/games" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="userId" value="USER_ID_HERE">
    
    <label for="title">Title:</label>
    <input type="text" name="title" required>
    
    <label for="genre">Genre:</label>
    <input type="text" name="genre" required>
    
    <label for="developer">Developer:</label>
    <input type="text" name="developer" required>
    
    <label for="platform">Platform:</label>
    <input type="text" name="platform" required>
    
    <label for="releaseDate">Release Date:</label>
    <input type="date" name="releaseDate" required>
    
    <label for="description">Description:</label>
    <textarea name="description" required></textarea>
    
    <label for="price">Price:</label>
    <input type="number" name="price" step="0.01" required>
    
    <label for="coverImage">Cover Image:</label>
    <input type="file" name="coverImage" accept="image/*" required>
    
    <button type="submit">Publish Game</button>
</form>
```

## Response Format

### Success Response
```json
{
    "message": "Book published successfully",
    "book": {
        "_id": "book_id",
        "title": "My Amazing Book",
        "author": "John Doe",
        "categories": "Fiction",
        "description": "An amazing story about adventure",
        "Coverpage": "/uploads/books/book-1703123456789-123456789.jpg",
        "Prices": 19.99,
        "publishedBy": {
            "_id": "user_id",
            "username": "john_doe",
            "email": "john@example.com"
        },
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
    }
}
```

### Error Responses
```json
// Missing file
{
    "error": "Cover image is required"
}

// Invalid file type
{
    "error": "Only JPEG, JPG, PNG, GIF, and WebP images are allowed!"
}

// File too large
{
    "error": "File too large. Maximum size is 5MB."
}
```

## Accessing Uploaded Images

Uploaded images are accessible via HTTP at:
- Books: `http://localhost:1412/uploads/books/filename.jpg`
- Games: `http://localhost:1412/uploads/games/filename.png`

The full URL is returned in the API response in the `Coverpage` (for books) or `coverImage` (for games) field.

## Notes

1. **File Storage**: Images are stored in the `uploads/` directory on the server
2. **Unique Filenames**: Each uploaded file gets a unique name to prevent conflicts
3. **File Validation**: Only image files are accepted with size limit of 5MB
4. **Update Behavior**: When updating, if no new image is provided, the existing image is kept
5. **Authentication**: All upload endpoints require user authentication via `userId` field