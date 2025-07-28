# Quick Setup Guide

## Issue: "Cannot find module multer"

This error occurs because the `multer` package needs to be installed.

## Solution

### Option 1: Automatic Installation
```bash
npm run install-deps
```

### Option 2: Manual Installation
```bash
npm install
```

### Option 3: Install Multer Specifically
```bash
npm install multer
```

## After Installation

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Create admin account (first time only):**
   ```bash
   npm run setup-admin
   ```

## Verify Installation

You should see output like:
```
[nodemon] starting `node server.js`
MongoDB connected
Server is running on http://localhost:1412
```

## If You Still Get Errors

1. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   npm --version
   ```
   
   Make sure you have Node.js 14+ and npm 6+

3. **Install dependencies one by one:**
   ```bash
   npm install express
   npm install mongoose
   npm install multer
   npm install cors
   npm install dotenv
   npm install nodemon
   ```

## Test File Upload

After the server is running, you can:

1. Open `test-upload.html` in your browser
2. Fill in a user ID (create a user first via `/API/signup`)
3. Upload a book or game with an image file

## Need Help?

If you're still having issues, please share:
- Your Node.js version (`node --version`)
- Your npm version (`npm --version`)
- The exact error message you're seeing