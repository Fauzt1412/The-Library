# API Documentation

## Overview
This API now supports user publishing of books and games with role-based access control.

## Admin Account
- **Username**: Fau
- **Password**: 123456
- **Role**: admin

## Setup
1. Run `npm run setup-admin` to create the admin account
2. Start the server with `npm run dev` or `npm start`

## Authentication
For protected routes, include `userId` in the request body to authenticate the user.

## User Roles
- **admin**: Can manage all users, books, and games
- **user**: Can publish and manage their own books and games

## API Endpoints

### Authentication Routes
- `POST /API/signup` - Register a new user
- `POST /API/login` - Login user
- `GET /API/logout` - Logout user

### User Management (Admin Only)
- `GET /API/users` - Get all users (requires admin)
- `GET /API/users/:id` - Get user by ID (requires admin)
- `POST /API/users` - Create new user (requires admin)
- `PUT /API/users/:id` - Update user (requires admin)
- `DELETE /API/users/:id` - Delete user (requires admin)

### Books

#### Public Routes
- `GET /API/books` - Get all books
- `GET /API/books/:id` - Get book by ID
- `GET /API/books/user/:userId` - Get books published by specific user

#### Protected Routes (Require Authentication)
- `POST /API/books` - Publish a new book (with file upload)
  **Content-Type**: `multipart/form-data`
  **Form Fields**:
  - `userId` (text) - User ID for authentication
  - `title` (text) - Book title
  - `author` (text) - Author name
  - `categories` (text) - Book categories
  - `description` (text) - Book description
  - `Prices` (text) - Book price
  - `coverImage` (file) - Cover image file (.jpg, .png, .gif, .webp, max 5MB)
- `GET /API/my-books` - Get current user's published books
  ```json
  {
    "userId": "user_id_here"
  }
  ```
- `PUT /API/books/:id` - Update book (only own books or admin)
- `DELETE /API/books/:id` - Delete book (only own books or admin)

### Games

#### Public Routes
- `GET /API/games` - Get all games
- `GET /API/games/:id` - Get game by ID
- `GET /API/games/user/:userId` - Get games published by specific user

#### Protected Routes (Require Authentication)
- `POST /API/games` - Publish a new game (with file upload)
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
  - `coverImage` (file) - Cover image file (.jpg, .png, .gif, .webp, max 5MB)
- `GET /API/my-games` - Get current user's published games
  ```json
  {
    "userId": "user_id_here"
  }
  ```
- `PUT /API/games/:id` - Update game (only own games or admin)
- `DELETE /API/games/:id` - Delete game (only own games or admin)

## Example Usage

### 1. Create a User Account
```bash
POST /API/signup
{
  "username": "john_doe",
  "password": "password123",
  "email": "john@example.com"
}
```

### 2. Login
```bash
POST /API/login
{
  "username": "john_doe",
  "password": "password123"
}
```

### 3. Publish a Book (with file upload)
```bash
curl -X POST http://localhost:1412/API/books \
  -F "userId=user_id_from_login_response" \
  -F "title=My Amazing Book" \
  -F "author=John Doe" \
  -F "categories=Fiction" \
  -F "description=An amazing story about..." \
  -F "Prices=19.99" \
  -F "coverImage=@/path/to/cover.jpg"
```

### 4. Publish a Game (with file upload)
```bash
curl -X POST http://localhost:1412/API/games \
  -F "userId=user_id_from_login_response" \
  -F "title=My Awesome Game" \
  -F "genre=Adventure" \
  -F "developer=John Doe Studios" \
  -F "platform=PC, Console" \
  -F "releaseDate=2024-12-01" \
  -F "description=An awesome game about..." \
  -F "price=49.99" \
  -F "coverImage=@/path/to/game-cover.png"
```

### 5. Get Your Published Content
```bash
GET /API/my-books
{
  "userId": "user_id_here"
}

GET /API/my-games
{
  "userId": "user_id_here"
}
```

## Response Format
All responses include appropriate HTTP status codes and JSON data:

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error description"
}
```

## Notes
- All published books and games are automatically linked to the user who published them
- Users can only edit/delete their own content (unless they're admin)
- Admin users can manage all content and users
- The `publishedBy` field is automatically populated and cannot be manually set