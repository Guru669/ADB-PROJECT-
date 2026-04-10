# Deployment Guide

## Project Structure
- Frontend: React application (port 3000)
- Backend: Node.js/Express API (port 5000)
- Database: MongoDB Atlas

## Deployment Options

### Option 1: Vercel (Recommended)
**Frontend Deployment:**
1. Push code to GitHub
2. Connect your GitHub account to Vercel
3. Import the `frontend` folder
4. Set environment variables:
   - `REACT_APP_API_BASE_URL`: Your deployed backend URL

**Backend Deployment:**
1. Push code to GitHub
2. Connect your GitHub account to Vercel
3. Import the `backend` folder
4. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret key
   - `FRONTEND_URL`: Your deployed frontend URL

### Option 2: Netlify + Railway
**Frontend (Netlify):**
1. Push code to GitHub
2. Connect GitHub to Netlify
3. Select the `frontend` folder
4. Build command: `npm run build`
5. Publish directory: `build`
6. Set environment variable: `REACT_APP_API_BASE_URL`

**Backend (Railway):**
1. Push code to GitHub
2. Connect GitHub to Railway
3. Select the `backend` folder
4. Set environment variables in Railway dashboard

### Option 3: AWS/Azure/GCP
Deploy using cloud services with Docker containers or static hosting.

## Environment Variables Required

### Frontend (.env)
```
REACT_APP_API_BASE_URL=https://your-backend-url.com
REACT_APP_NAME=Student Portfolio Management System
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
REACT_APP_QR_CODE_URL=https://api.qrserver.com/v1/create-qr-code/
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
```

## Deployment Steps

1. **Update Environment Variables**
   - Replace localhost URLs with production URLs
   - Set production environment flag

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy Backend**
   - Choose your platform (Vercel, Railway, etc.)
   - Set environment variables
   - Deploy

4. **Deploy Frontend**
   - Choose your platform (Vercel, Netlify, etc.)
   - Set backend URL in environment variables
   - Deploy

5. **Test Deployment**
   - Verify frontend loads
   - Test API endpoints
   - Test user authentication

## Current Status
- [x] Frontend built for production
- [x] Environment variables updated
- [x] Deployment configurations created
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Testing completed
