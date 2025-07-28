# Book & Game Publishing API

A Node.js/Express API that allows users to publish and manage books and games with role-based access control.

## Features

### Backend API
- ✅ User authentication and authorization
- ✅ Role-based access control (Admin/User)
- ✅ Users can publish books and games
- ✅ File upload for cover images (PNG, JPG, GIF, WebP)
- ✅ Users can manage their own content
- ✅ Admins can manage all content and users
- ✅ Pre-configured admin account
- ✅ Static file serving for uploaded images

### Frontend Web App
- ✅ Modern, responsive web interface
- ✅ User registration and login
- ✅ Browse books and games
- ✅ Publish content with file upload
- ✅ Manage personal content
- ✅ Mobile-friendly design

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Admin Account
```bash
npm run setup-admin
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 4. Access the Application
- **Web Interface**: `http://localhost:1412`
- **API Endpoints**: `http://localhost:1412/API`

## Admin Account

After running the setup script, you'll have an admin account:
- **Username**: `Fau`
- **Password**: `123456`
- **Role**: `admin`

## API Usage Examples

### 1. Register a New User
```bash
POST http://localhost:1412/API/signup
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123",
  "email": "john@example.com"
}
```

### 2. Login
```bash
POST http://localhost:1412/API/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

### 3. Publish a Book (with file upload)
```bash
curl -X POST http://localhost:1412/API/books \
  -F "userId=USER_ID_FROM_LOGIN" \
  -F "title=My Amazing Book" \
  -F "author=John Doe" \
  -F "categories=Fiction" \
  -F "description=An amazing story about adventure and friendship" \
  -F "Prices=19.99" \
  -F "coverImage=@/path/to/your/book-cover.jpg"
```

### 4. Publish a Game (with file upload)
```bash
curl -X POST http://localhost:1412/API/games \
  -F "userId=USER_ID_FROM_LOGIN" \
  -F "title=Epic Adventure Game" \
  -F "genre=Adventure" \
  -F "developer=John Doe Studios" \
  -F "platform=PC, PlayStation, Xbox" \
  -F "releaseDate=2024-12-01" \
  -F "description=An epic adventure game with stunning graphics" \
  -F "price=49.99" \
  -F "coverImage=@/path/to/your/game-cover.png"
```

### 5. Get Your Published Content
```bash
# Get your books
GET http://localhost:1412/API/my-books
Content-Type: application/json

{
  "userId": "USER_ID_HERE"
}

# Get your games
GET http://localhost:1412/API/my-games
Content-Type: application/json

{
  "userId": "USER_ID_HERE"
}
```

## Available Endpoints

### Public Endpoints
- `GET /API/books` - Get all books
- `GET /API/games` - Get all games
- `GET /API/books/:id` - Get specific book
- `GET /API/games/:id` - Get specific game
- `GET /API/books/user/:userId` - Get books by user
- `GET /API/games/user/:userId` - Get games by user

### Authentication
- `POST /API/signup` - Register new user
- `POST /API/login` - Login user
- `GET /API/logout` - Logout user

### User Publishing (Requires Authentication)
- `POST /API/books` - Publish a book
- `POST /API/games` - Publish a game
- `GET /API/my-books` - Get your books
- `GET /API/my-games` - Get your games
- `PUT /API/books/:id` - Update your book
- `PUT /API/games/:id` - Update your game
- `DELETE /API/books/:id` - Delete your book
- `DELETE /API/games/:id` - Delete your game

### Admin Only (Requires Admin Role)
- `GET /API/users` - Get all users
- `POST /API/users` - Create user
- `PUT /API/users/:id` - Update user
- `DELETE /API/users/:id` - Delete user

## Authentication

For protected routes, include the `userId` in your request body:

```json
{
  "userId": "your_user_id_here",
  "...other_data"
}
```

## Project Structure

```
Server/
├── API/
│   ├── controllers/
│   │   ├── AuthenticationController.js
│   │   ├── BookController.js
│   │   ├── GameController.js
│   │   └── UserController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── books.js
│   │   ├── games.js
│   │   └── users.js
│   └── routes/
│       ├── AURoute.js
│       ├── BookRoute.js
│       ├── GameRoute.js
│       └── UserRoute.js
├── .env
├── package.json
├── server.js
├── setup-admin.js
└── README.md
```

## Environment Variables

Create a `.env` file with:
```
PORT=1412
DATABASE_URL=your_mongodb_connection_string
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).