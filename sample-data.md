# Sample Data for Testing

## Sample Books

### Book 1
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "categories": "Classic Literature",
  "description": "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
  "publishedDate": "1925-04-10",
  "Coverpage": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
  "Prices": 12.99
}
```

### Book 2
```json
{
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "categories": "Fiction",
  "description": "A gripping tale of racial injustice and childhood innocence in the American South.",
  "publishedDate": "1960-07-11",
  "Coverpage": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
  "Prices": 14.99
}
```

### Book 3
```json
{
  "title": "1984",
  "author": "George Orwell",
  "categories": "Dystopian Fiction",
  "description": "A dystopian social science fiction novel about totalitarian control and surveillance.",
  "publishedDate": "1949-06-08",
  "Coverpage": "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&h=400&fit=crop",
  "Prices": 13.99
}
```

## Sample Games

### Game 1
```json
{
  "title": "The Legend of Zelda: Breath of the Wild",
  "genre": "Action-Adventure",
  "developer": "Nintendo",
  "platform": "Nintendo Switch",
  "releaseDate": "2017-03-03",
  "description": "An open-world action-adventure game that redefines the Zelda series with complete freedom of exploration.",
  "coverImage": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=400&fit=crop",
  "price": 59.99
}
```

### Game 2
```json
{
  "title": "Cyberpunk 2077",
  "genre": "RPG",
  "developer": "CD Projekt Red",
  "platform": "PC",
  "releaseDate": "2020-12-10",
  "description": "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
  "coverImage": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=400&fit=crop",
  "price": 49.99
}
```

### Game 3
```json
{
  "title": "Minecraft",
  "genre": "Sandbox",
  "developer": "Mojang Studios",
  "platform": "Multi-platform",
  "releaseDate": "2011-11-18",
  "description": "A sandbox video game where players can build, explore, and survive in a blocky, procedurally-generated 3D world.",
  "coverImage": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=400&fit=crop",
  "price": 26.95
}
```

## Sample Users

### Admin User
```json
{
  "username": "admin",
  "email": "admin@librarystore.com",
  "password": "admin123",
  "role": "admin"
}
```

### Regular User
```json
{
  "username": "user",
  "email": "user@example.com",
  "password": "user123",
  "role": "user"
}
```

### Test User
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123",
  "role": "user"
}
```

## How to Add Sample Data

### Using the Admin Panel (Recommended)
1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Login with admin credentials (admin/admin123)
4. Go to Admin Panel
5. Use the forms to add the sample data above

### Using API Directly (Advanced)
You can also use tools like Postman or curl to directly add data to the API endpoints:

#### Add a Book
```bash
curl -X POST http://localhost:1412/API/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "categories": "Classic Literature",
    "description": "A classic American novel set in the Jazz Age...",
    "publishedDate": "1925-04-10",
    "Coverpage": "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
    "Prices": 12.99
  }'
```

#### Add a Game
```bash
curl -X POST http://localhost:1412/API/games \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Legend of Zelda: Breath of the Wild",
    "genre": "Action-Adventure",
    "developer": "Nintendo",
    "platform": "Nintendo Switch",
    "releaseDate": "2017-03-03",
    "description": "An open-world action-adventure game...",
    "coverImage": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8",
    "price": 59.99
  }'
```

#### Add a User
```bash
curl -X POST http://localhost:1412/API/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'
```