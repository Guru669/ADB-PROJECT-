# Render.com Deployment Guide

## Overview
Render.com is a cloud platform that simplifies deployment with automatic Git integration and environment variable management.

## Step-by-Step Deployment

### 1. Sign Up and Connect GitHub
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 2. Backend Deployment (Node.js Service)

**Manual Setup:**
1. Click **"New +"** in Render dashboard
2. Select **"Web Service"**
3. Choose your GitHub repository: `Guru669/ADB-PROJECT-`
4. **Service Configuration:**
   - **Name:** `adb-project-backend`
   - **Environment:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free` (to start)

**Environment Variables for Backend:**
```
MONGODB_URI=mongodb+srv://gprasanth3110_db_user:3K0RQvglAk7UTsVb@cluster0.3ibmatv.mongodb.net/studentPortfolio?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=e8766c9fa46904cd9a6721439685daca2aef58a849e68cb38d7cb101ef2b53bc
PORT=5000
FRONTEND_URL=https://adb-project-frontend.onrender.com
```

**Advanced Settings:**
- **Health Check Path:** `/`
- **Auto-Deploy:** Enabled

### 3. Frontend Deployment (Static Site)

**Manual Setup:**
1. Click **"New +"** in Render dashboard
2. Select **"Static Site"**
3. Choose the same GitHub repository
4. **Service Configuration:**
   - **Name:** `adb-project-frontend`
   - **Environment:** `Static`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `build`
   - **Instance Type:** `Free` (to start)

**Environment Variables for Frontend:**
```
REACT_APP_API_BASE_URL=https://adb-project-backend.onrender.com
REACT_APP_NAME=Student Portfolio Management System
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
REACT_APP_QR_CODE_URL=https://api.qrserver.com/v1/create-qr-code/
```

### 4. Using render.yaml (Recommended)

**Automatic Setup:**
1. The `render.yaml` file is already created in your repository
2. When you connect your repo to Render, it will automatically detect this file
3. Render will create both services with the specified configurations

### 5. Deployment URLs

After deployment:
- **Backend URL:** `https://adb-project-backend.onrender.com`
- **Frontend URL:** `https://adb-project-frontend.onrender.com`

### 6. Important Notes

**Render Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- Cold start takes 30-90 seconds
- Limited to 750 hours/month

**Environment Variables:**
- All sensitive data should be in environment variables
- Never commit secrets to Git
- Use Render's encrypted environment variables

**Database Connection:**
- MongoDB Atlas works well with Render
- Ensure your MongoDB Atlas allows connections from Render's IP ranges

**CORS Configuration:**
- Backend should allow requests from your frontend URL
- Current CORS is set to `*` (works for development)

### 7. Testing the Deployment

1. **Backend Health Check:**
   - Visit `https://adb-project-backend.onrender.com/`
   - Should return API status JSON

2. **Frontend Loading:**
   - Visit `https://adb-project-frontend.onrender.com`
   - Should load the React application

3. **API Integration:**
   - Test login/registration functionality
   - Check browser console for any errors

### 8. Troubleshooting

**Common Issues:**
- **Cold Start:** First request may take 30-90 seconds
- **Build Failures:** Check build logs in Render dashboard
- **Environment Variables:** Ensure all required variables are set
- **CORS Issues:** Update backend CORS if needed

**Debug Steps:**
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser developer console

## Quick Start Checklist

- [ ] GitHub repository connected to Render
- [ ] Backend service deployed with environment variables
- [ ] Frontend service deployed with correct API URL
- [ ] Both services are live and accessible
- [ ] API integration is working
- [ ] User authentication is functional

## Current Status

- [x] render.yaml configuration created
- [x] Environment variables documented
- [x] Deployment guide prepared
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Testing completed
