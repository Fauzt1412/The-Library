# 🔧 Troubleshooting Guide: "Failed to load resource: net::ERR_FAILED"

## ✅ Issues Fixed

### 1. Missing Static Files
- ✅ **Created `frontend/public/favicon.ico`** - Browser was trying to load this file
- ✅ **Created `frontend/public/manifest.json`** - Required for PWA functionality
- ✅ **Removed reference to missing `logo192.png`** - File didn't exist in public folder

## 🔍 Common Causes & Solutions

### 2. Backend Server Not Running
**Problem**: Your frontend tries to connect to `http://localhost:1412` but the server isn't running.

**Solution**: Start your backend server
```bash
# Navigate to Server directory
cd Server

# Install dependencies (if not done)
npm install

# Start the server
npm run dev
# OR
npm start
```

**Verify**: Check if server is running by visiting `http://localhost:1412/health`

### 3. Database Connection Issues
**Problem**: MongoDB not connected or wrong connection string.

**Check**: Look at your `Server/.env` file:
```bash
cd Server
cat .env
```

**Required variables**:
```env
DATABASE_URL=mongodb://localhost:27017/Storage_database_SYS
PORT=1412
FRONTEND_URL=http://localhost:3000
```

### 4. CORS Issues
**Problem**: Cross-Origin Resource Sharing blocking requests.

**Solution**: Your server is already configured for CORS, but ensure these origins are allowed:
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:3000`

### 5. Network/Firewall Issues
**Problem**: Local firewall or antivirus blocking connections.

**Solutions**:
- Temporarily disable firewall/antivirus
- Check if port 1412 is available: `netstat -an | findstr 1412`
- Try different port in both frontend and backend

### 6. Environment Variables
**Problem**: Wrong API URL in frontend environment files.

**Check your frontend environment files**:
- `frontend/.env.local` should have: `REACT_APP_API_URL=http://localhost:1412`
- `frontend/.env.production` should have your production URL

## 🚀 Step-by-Step Debugging

### Step 1: Start Backend Server
```bash
cd Server
npm install
npm run dev
```

**Expected output**:
```
🚀 Starting server on port 1412
📊 Database URL: mongodb://localhost:27017/Storage_database_SYS
🌐 CORS configured for origins: [ 'http://localhost:3000', 'http://127.0.0.1:3000' ]
✅ MongoDB connected
🚀 Server is running on http://localhost:1412
```

### Step 2: Test Backend Health
Open browser and go to: `http://localhost:1412/health`

**Expected response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "port": 1412,
  "database": "connected"
}
```

### Step 3: Start Frontend
```bash
cd frontend
npm install
npm start
```

### Step 4: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Check Network tab for failed requests

## 🔧 Quick Fixes

### Fix 1: Clear Browser Cache
```bash
# Chrome/Edge: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Or use incognito/private mode
```

### Fix 2: Restart Development Servers
```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Terminal 1 - Backend
cd Server
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Fix 3: Check MongoDB
```bash
# If using local MongoDB, ensure it's running
# Windows: Check Services for MongoDB
# Mac/Linux: sudo systemctl status mongod
```

### Fix 4: Update Dependencies
```bash
# Backend
cd Server
npm update

# Frontend
cd frontend
npm update
```

## 🌐 Production Deployment Issues

If you're deploying to production:

### Frontend (Vercel/Netlify)
- Ensure `REACT_APP_API_URL` points to your production backend
- Check build logs for errors

### Backend (Render/Heroku)
- Ensure `DATABASE_URL` points to your cloud MongoDB
- Check server logs for connection errors
- Verify environment variables are set

## 📞 Still Having Issues?

### Check These Files:
1. `Server/.env` - Database and port configuration
2. `frontend/.env.local` - API URL for development
3. `frontend/package.json` - Dependencies
4. `Server/package.json` - Backend dependencies

### Common Error Messages:
- **"net::ERR_CONNECTION_REFUSED"** → Backend server not running
- **"net::ERR_NAME_NOT_RESOLVED"** → Wrong URL/domain
- **"CORS error"** → Cross-origin request blocked
- **"404 Not Found"** → Wrong API endpoint
- **"500 Internal Server Error"** → Backend/database issue

### Debug Commands:
```bash
# Check if port is in use
netstat -an | findstr 1412

# Test API directly
curl http://localhost:1412/health

# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"
```

## ✨ Success Indicators

When everything is working correctly, you should see:

1. **Backend Console**: Server running messages with no errors
2. **Frontend Console**: No red error messages
3. **Browser Network Tab**: Successful API calls (200 status)
4. **Application**: Data loading properly, no "Failed to load" errors

---

*This guide covers the most common causes of the "Failed to load resource: net::ERR_FAILED" error in your React + Express + MongoDB application.*