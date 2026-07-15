# Jamia Tul Uloom Muhammadiya - Backend API

Enterprise-grade REST API for the Online Islamic Academy Platform.

## Architecture

```
server/
├── src/
│   ├── config/        # Application configuration (env, db, firebase, cloudinary)
│   ├── constants/     # HTTP status codes, messages, roles, API routes
│   ├── controllers/   # Request handlers (thin layer)
│   ├── database/      # Database connection module
│   ├── firebase/      # Firebase admin SDK module
│   ├── helpers/       # Utility helper functions
│   ├── middlewares/    # Auth, validation, error handling, upload, rate limiting
│   ├── models/        # Mongoose schemas (User, Course, Student, etc.)
│   ├── routes/        # Express route definitions (thin layer)
│   ├── services/      # Business logic layer
│   ├── utils/         # ApiError, ApiResponse, asyncHandler, logger, helpers
│   ├── validators/    # express-validator rule sets
│   ├── app.js         # Express application setup
│   └── server.js      # Entry point
├── uploads/           # Local file uploads
├── logs/              # Application logs
├── public/            # Static assets
├── docs/              # API documentation
├── tests/             # Test files
└── package.json
```

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** Firebase Admin + JWT
- **File Upload:** Multer + Cloudinary
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting, bcrypt
- **Logging:** Winston + Morgan
- **Testing:** Jest + Supertest

## Getting Started

1. Copy `.env.example` to `.env` and fill in values
2. Run `npm install`
3. Run `npm run dev` for development
4. Run `npm start` for production

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Module      | Base Path           |
|-------------|---------------------|
| Auth        | `/api/v1/auth`      |
| Users       | `/api/v1/users`     |
| Students    | `/api/v1/students`  |
| Teachers    | `/api/v1/teachers`  |
| Courses     | `/api/v1/courses`   |
| Gallery     | `/api/v1/gallery`   |
| News        | `/api/v1/news`      |
| Admissions  | `/api/v1/admissions`|
| Settings    | `/api/v1/settings`  |
| Health      | `/api/v1/health`    |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint source code

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```
