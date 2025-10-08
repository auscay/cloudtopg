# Educational Management System Backend

A modular backend API for an educational management system built with TypeScript, Express.js, and MongoDB. This project implements a clean JWT authentication system with modular architecture focusing on core functionality.

## 🚀 Features

- **JWT Authentication System**
  - User registration (signup)
  - User login
  - User profile retrieval
  - Role-based access control (Admin, Teacher, Student, Parent)

- **Modular Architecture**
  - Organized by modules (auth, user, admin)
  - Repository pattern for data access
  - Service layer for business logic
  - Controller layer for request handling
  - Middleware for authentication and validation

- **Security Features**
  - Password hashing with bcrypt
  - JWT token implementation
  - Input validation and sanitization
  - CORS protection
  - Helmet security headers

- **Database & Models**
  - MongoDB with Mongoose ODM
  - User model with comprehensive schema
  - Database connection management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: bcryptjs, helmet, cors
- **Development**: nodemon, ts-node

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database connection
│   └── index.ts      # Main configuration
├── middleware/       # Global middleware
│   ├── errorHandler.ts
│   └── validation.ts # Validation middleware
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   │   ├── controllers/
│   │   │   └── AuthController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   └── JwtService.ts
│   │   └── validators/
│   │       └── authValidators.ts
│   ├── user/         # User module
│   │   ├── models/
│   │   │   └── User.ts
│   │   └── repositories/
│   │       ├── BaseRepository.ts
│   │       └── UserRepository.ts
│   └── admin/        # Admin module
│       ├── controllers/
│       │   └── AdminController.ts
│       └── routes/
│           └── admin.ts
├── routes/           # Main router
│   └── index.ts      # Route aggregator
├── types/            # TypeScript interfaces
│   ├── auth.ts
│   ├── user.ts
│   ├── common.ts
│   └── index.ts
├── utils/            # Utility functions
│   ├── logger.ts
│   └── response.ts
├── app.ts            # Express app configuration
└── index.ts          # Server entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd educational-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/educational_management
   MONGODB_TEST_URI=mongodb://localhost:27017/educational_management_test
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
   JWT_REFRESH_EXPIRE=30d
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000,http://localhost:3001
   
   # Logging
   LOG_LEVEL=info
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### Authentication Endpoints

#### Register User (Signup)
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "student"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer your_access_token_here
```

### Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /api/v1/admin/users
Authorization: Bearer your_admin_access_token_here
```

### Utility Endpoints

#### Health Check
```http
GET /api/v1/health
```

#### API Version
```http
GET /api/v1/version
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access
- **Teacher**: Access to teaching resources and student data
- **Student**: Access to personal data and assignments
- **Parent**: Access to child's data

### JWT Token Structure
- **Access Token**: Short-lived (7 days by default)
- **Refresh Token**: Long-lived (30 days by default)
- **Token Payload**: Contains user ID, email, and role

### Protected Routes
All routes except registration, login, and health check require authentication via Bearer token in the Authorization header.

## 🛡️ Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Rate Limiting
- 100 requests per 15 minutes per IP
- 5 login attempts per 15 minutes per IP

### Input Validation
- Comprehensive validation using Joi schemas
- Sanitization of user inputs
- Protection against XSS attacks

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Building
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint errors

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Consistent import/export patterns

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with JWT authentication system
  - User registration and login
  - Role-based access control
  - Password management
  - Token refresh mechanism
  - Comprehensive validation
  - Security middleware

---

**Built with ❤️ for educational institutions**
