# The Library - Digital Content Management Platform

A comprehensive full-stack web application for managing and sharing digital books and games, built with the MERN stack (MongoDB, Express.js, React, Node.js). This platform combines content management, user interaction, and real-time communication features.

## Features

### Frontend (React)
- **Responsive Design**: Modern, mobile-friendly interface using Bootstrap
- **User Authentication**: Login and signup functionality
- **Product Browsing**: Browse books and games with search and filter options
- **Detailed Views**: Individual product pages with complete information
- **Admin Panel**: Full CRUD operations for managing books, games, and users
- **Protected Routes**: Role-based access control

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for all entities
- **MongoDB Integration**: Using Mongoose for data modeling
- **CORS Support**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error handling and validation

## Project Structure

```
Newproject/
├── Server/                 # Backend
│   ├── API/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database schemas
│   │   └── routes/         # API endpoints
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
└── frontend/              # React frontend
    ├── public/
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   ├── context/       # React context
    │   └── styles/        # CSS styles
    └── package.json       # Frontend dependencies
```

## API Endpoints

### Authentication
- `POST /API/signup` - User registration
- `POST /API/login` - User login
- `GET /API/logout` - User logout

### Books
- `GET /API/books` - Get all books
- `GET /API/books/:id` - Get book by ID
- `POST /API/books` - Create new book
- `PUT /API/books/:id` - Update book
- `DELETE /API/books/:id` - Delete book

### Games
- `GET /API/games` - Get all games
- `GET /API/games/:id` - Get game by ID
- `POST /API/games` - Create new game
- `PUT /API/games/:id` - Update game
- `DELETE /API/games/:id` - Delete game

### Users
- `GET /API/users` - Get all users
- `GET /API/users/:id` - Get user by ID
- `POST /API/users` - Create new user
- `PUT /API/users/:id` - Update user
- `DELETE /API/users/:id` - Delete user

## Data Models

### Book Schema
```javascript
{
  title: String (required),
  author: String (required),
  categories: String (required),
  description: String (required),
  publishedDate: Date (required),
  Coverpage: String (required),
  Prices: Number (required)
}
```

### Game Schema
```javascript
{
  title: String (required),
  genre: String (required),
  developer: String (required),
  platform: String (required),
  releaseDate: Date (required),
  description: String (required),
  coverImage: String (required),
  price: Number (required)
}
```

### User Schema
```javascript
{
  username: String (required, unique),
  password: String (required),
  email: String (required, unique),
  role: String (default: 'user'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the Server directory:
   ```bash
   cd Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the `.env` file with your MongoDB connection string:
   ```
   localhost = "http://localhost"
   port = 1412
   databaseURL = "your_mongodb_connection_string"
   ```

4. Start the server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:1412`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Usage

### For Regular Users
1. **Browse Products**: Visit the Books or Games pages to browse available items
2. **Search & Filter**: Use the search bar and filters to find specific items
3. **View Details**: Click on any item to see detailed information
4. **Create Account**: Sign up for a new account or log in with existing credentials

### For Administrators
1. **Login as Admin**: Use admin credentials to access the admin panel
2. **Manage Inventory**: Add, edit, or delete books and games
3. **User Management**: View and manage user accounts
4. **Full CRUD Operations**: Complete control over all data

### Demo Credentials
- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- Bootstrap 5 for styling
- Font Awesome for icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin requests
- dotenv for environment variables

## Features Implemented

### CRUD Operations
- ✅ **Create**: Add new books, games, and users
- ✅ **Read**: View all items and individual details
- ✅ **Update**: Edit existing items
- ✅ **Delete**: Remove items from the database

### User Experience
- ✅ Responsive design for all screen sizes
- ✅ Search and filter functionality
- ✅ User authentication and authorization
- ✅ Error handling and loading states
- ✅ Success/error notifications

### Security
- ✅ Role-based access control
- ✅ Protected admin routes
- ✅ Input validation

## Future Enhancements

- Shopping cart functionality
- Payment integration
- Order management
- Email notifications
- Advanced search with multiple filters
- User reviews and ratings
- Inventory management
- Sales analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.