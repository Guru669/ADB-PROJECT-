# Student Portfolio Management System - Backend

## Description
Backend API for the Student Portfolio Management System using Express.js, MongoDB, and Node.js.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://127.0.0.1:27017/studentPortfolio
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/students` - Get all students
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-portfolio` - Update user portfolio
- `DELETE /api/auth/delete-student/:email` - Delete student

## Database

This application uses MongoDB. Ensure MongoDB is running on your system or provide a MongoDB Atlas connection string in the `.env` file.

## Deployment

### Deployment Steps

1. **Install dependencies:**
   ```bash
   npm install --production
   ```

2. **Set environment variables:**
   - Create a `.env` file with production values
   - Ensure MongoDB URI is set to production database

3. **Start the server:**
   ```bash
   npm start
   ```

### Platform-Specific Deployment

#### Heroku
```bash
heroku create
heroku addons:create mongolab
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

#### Vercel/Railway
- Connect your repository
- Set environment variables in the platform dashboard
- Deploy automatically

## Dependencies

- express
- mongoose
- cors
- bcryptjs
- jsonwebtoken
- dotenv
- multer

## License

ISC
