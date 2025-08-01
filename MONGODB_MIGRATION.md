# MongoDB Migration Guide

## Overview
Project đã được migrate từ MySQL/TypeORM sang MongoDB/Mongoose.

## Changes Made

### 1. Dependencies
- **Added**: `@nestjs/mongoose`, `mongoose`
- **Removed**: `@nestjs/typeorm`, `typeorm`, `mysql2`

### 2. Database Configuration
- **Old**: MySQL configuration với TypeORM
- **New**: MongoDB configuration với Mongoose

### 3. Schema Changes
- **Old**: TypeORM entities (`UserEntity`, `AbstractEntity`)
- **New**: Mongoose schemas (`User` schema)

### 4. Service Changes
- **UsersService**: Chuyển từ Repository pattern sang Model pattern
- **AuthService**: Cập nhật để sử dụng MongoDB
- **TokenService**: Cập nhật để sử dụng MongoDB

## Environment Variables

### Required
```env
APP_PORT=8080
JWT_ACCESS_SECRETKEY=your-access-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRETKEY=your-refresh-secret-key
JWT_REFRESH_EXPIRES=7d
RESET_PASSWORD=123456
```

### Optional
```env
MONGODB_URI=mongodb://localhost:27017/racing-car
```

## Setup MongoDB

### 1. Install MongoDB
```bash
# Windows (using chocolatey)
choco install mongodb

# macOS (using homebrew)
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb
```

### 2. Start MongoDB
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

### 3. Create Database
```bash
mongosh
use racing-car
```

## Running the Application

### 1. Install Dependencies
```bash
yarn install
```

### 2. Set Environment Variables
Copy `.env.example` to `.env` and configure your variables.

### 3. Seed Database (Optional)
```bash
yarn seed
```

### 4. Start Application
```bash
# Development
yarn start:dev

# Production
yarn build
yarn start:prod
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token

### Users
- `GET /api/v1/users` - Get users (with pagination)
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### WebSocket
- `ws://localhost:8080?token=<jwt_token>` - WebSocket connection

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  phone: String,
  password: String (hashed),
  status: String (default: 'ACTIVE'),
  name: String (required),
  dateOfBirth: Date,
  address: String,
  identityId: String (unique, sparse),
  refreshToken: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

## Migration Notes

### Key Differences
1. **ID Field**: MongoDB uses `_id` instead of `id`
2. **Relationships**: MongoDB uses references instead of foreign keys
3. **Queries**: MongoDB uses aggregation pipeline instead of SQL
4. **Indexes**: MongoDB indexes are defined in schema

### Performance Considerations
1. **Indexes**: Ensure proper indexes on frequently queried fields
2. **Projection**: Use projection to limit returned fields
3. **Pagination**: Use `skip()` and `limit()` for pagination
4. **Aggregation**: Use aggregation pipeline for complex queries

## Troubleshooting

### Common Issues
1. **Connection Error**: Ensure MongoDB is running
2. **Authentication Error**: Check MongoDB connection string
3. **Schema Validation**: Ensure data matches schema requirements

### Debug Commands
```bash
# Check MongoDB status
mongosh --eval "db.serverStatus()"

# Check database
mongosh racing-car --eval "db.stats()"

# Check collections
mongosh racing-car --eval "db.getCollectionNames()"
``` 