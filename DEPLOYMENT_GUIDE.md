# 🚀 Cloud Deployment Guide - MERN Stack App

This guide will help you deploy your Library & Games Store application to the cloud using **Vercel** (frontend) and **Render** (backend).

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **MongoDB Atlas** - Your database is already set up ✅

## 🎯 Deployment Strategy

- **Frontend (React)** → Vercel
- **Backend (Node.js/Express)** → Render
- **Database (MongoDB)** → MongoDB Atlas (already configured)
- **File Storage** → Render's persistent disk

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for cloud deployment"
git push origin main
```

### 1.2 Verify File Structure
Your repository should look like this:
```
Newproject/
├── frontend/           # React app
├── Server/            # Node.js backend
├── vercel.json        # Vercel configuration
├── render.yaml        # Render configuration
└── DEPLOYMENT_GUIDE.md
```

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create New Web Service
1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `library-games-store-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy Settings:**
- **Root Directory**: `Server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.2 Environment Variables
Add these environment variables in Render:

| Key | Value |
|-----|-------|
| `PORT` | `10000` (Render's default) |
| `DATABASE_URL` | `mongodb+srv://vannq1412:chinhbong1412@cluster0.w9zw5oh.mongodb.net/Storage_database_SYS` |
| `FRONTEND_URL` | `https://your-app-name.vercel.app` (update after frontend deployment) |

### 2.3 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://your-backend-name.onrender.com`

## ⚡ Step 3: Deploy Frontend to Vercel

### 3.1 Update Environment Variables
Update `frontend/.env.production` with your Render backend URL:
```env
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure the project:

**Framework Preset**: `Create React App`
**Root Directory**: `frontend`
**Build Command**: `npm run build`
**Output Directory**: `build`

### 3.2 Environment Variables in Vercel
Add this environment variable:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://the-library-a11t.onrender.com` |

### 3.4 Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Note your frontend URL: `https://your-app-name.vercel.app`

## 🔄 Step 4: Update CORS Configuration

### 4.1 Update Backend Environment
Go back to Render and update the `FRONTEND_URL` environment variable:
```
FRONTEND_URL=https://your-app-name.vercel.app
```

### 4.2 Redeploy Backend
1. In Render dashboard, go to your backend service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for redeployment

## ✅ Step 5: Test Your Deployment

### 5.1 Test Backend
Visit: `https://your-backend-name.onrender.com/health`
Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "port": 10000,
  "database": "connected"
}
```

### 5.2 Test Frontend
1. Visit: `https://your-app-name.vercel.app`
2. Test user registration/login
3. Test browsing books and games
4. Test admin functionality

## 🎉 Your Live URLs

After successful deployment:

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-backend-name.onrender.com`
- **API**: `https://your-backend-name.onrender.com/API`

## 🔧 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Ensure `FRONTEND_URL` is correctly set in Render environment variables.

### Issue 2: Images Not Loading
**Solution**: Images are served from your backend. Make sure the backend URL is correct in `REACT_APP_API_URL`.

### Issue 3: Database Connection Failed
**Solution**: Verify your MongoDB Atlas connection string in Render environment variables.

### Issue 4: Build Failures
**Solution**: 
- Check build logs in Vercel/Render
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## 🚀 Performance Optimizations

### Backend (Render)
- **Free Tier**: Service sleeps after 15 minutes of inactivity
- **Paid Tier**: Always-on service for better performance

### Frontend (Vercel)
- Automatic CDN distribution
- Optimized builds
- Edge caching

## 📊 Monitoring

### Render Dashboard
- View logs and metrics
- Monitor resource usage
- Set up alerts

### Vercel Analytics
- Track page views
- Monitor performance
- View deployment history

## 🔄 Future Updates

### Updating Backend
1. Push changes to GitHub
2. Render auto-deploys from `main` branch

### Updating Frontend
1. Push changes to GitHub
2. Vercel auto-deploys from `main` branch

## 💡 Pro Tips

1. **Environment Variables**: Never commit sensitive data to GitHub
2. **Database**: Consider MongoDB Atlas backup strategies
3. **Monitoring**: Set up uptime monitoring (UptimeRobot, etc.)
4. **Custom Domain**: Both Vercel and Render support custom domains
5. **SSL**: Both platforms provide free SSL certificates

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

🎉 **Congratulations!** Your MERN stack application is now live in the cloud!