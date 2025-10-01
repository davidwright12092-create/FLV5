# FieldLink v5 Backend API

AI-powered conversation analysis platform for field services. Built with Express.js, TypeScript, PostgreSQL, and Prisma.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👥 **Multi-tenant** - Organization-based data isolation
- 🎙️ **Recording Management** - Upload and manage audio recordings
- 📝 **Transcription** - Google Cloud Speech-to-Text integration
- 🤖 **AI Analysis** - OpenAI GPT-4 powered conversation analysis
- 📊 **Analytics** - Sentiment analysis, process adherence, sales opportunities
- 🔒 **Security** - Helmet, CORS, rate limiting, input validation
- 🚀 **Real-time** - WebSocket support for live updates
- 📦 **File Storage** - AWS S3 integration

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt
- **Validation:** Zod
- **File Upload:** Multer
- **Cloud Services:** AWS S3, OpenAI, Google Cloud Speech

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis (optional, for caching)
- AWS Account (for S3 storage)
- OpenAI API Key
- Google Cloud Account (for Speech-to-Text)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fieldlink_v5"

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=fieldlink-recordings

# OpenAI (for AI analysis)
OPENAI_API_KEY=your-openai-api-key

# Google Cloud (for transcription)
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5001`

## API Documentation

### Base URL

```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "ACME Corp",
  "industry": "Technology"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Recording Endpoints

All recording endpoints require authentication.

#### Get All Recordings
```http
GET /api/recordings?page=1&limit=10
Authorization: Bearer {token}
```

#### Get Single Recording
```http
GET /api/recordings/:id
Authorization: Bearer {token}
```

#### Create Recording
```http
POST /api/recordings
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Customer Call - ABC Corp",
  "duration": 1200,
  "fileSize": 5242880,
  "s3Key": "recordings/uuid.mp3",
  "s3Url": "https://s3.amazonaws.com/..."
}
```

#### Update Recording
```http
PATCH /api/recordings/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "COMPLETED"
}
```

#### Delete Recording
```http
DELETE /api/recordings/:id
Authorization: Bearer {token}
```

### User Management Endpoints

#### Get All Users (Organization)
```http
GET /api/users?page=1&limit=10
Authorization: Bearer {token}
```

#### Get Single User
```http
GET /api/users/:id
Authorization: Bearer {token}
```

#### Update User
```http
PATCH /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "role": "MANAGER"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer {token}
```

## Database Schema

### Models

- **Organization** - Multi-tenant organization
- **User** - Users within organizations (ADMIN, MANAGER, USER)
- **Recording** - Audio recording metadata
- **Transcription** - Speech-to-text results
- **AnalysisResult** - AI analysis results
- **ProcessTemplate** - Custom sales process templates

### Relationships

```
Organization
  ├── Users (1:many)
  ├── Recordings (1:many)
  └── ProcessTemplates (1:many)

Recording
  ├── User (many:1)
  ├── Organization (many:1)
  ├── Transcription (1:1)
  └── AnalysisResult (1:1)
```

## Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Configured for frontend origin
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **JWT Authentication** - Stateless authentication
- **Password Hashing** - bcrypt with 10 salt rounds
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **Error Handling** - Centralized error handling with proper status codes

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Prisma client setup
│   │   └── env.ts        # Environment validation
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── recordings.controller.ts
│   │   └── users.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication & authorization
│   │   ├── validate.ts   # Request validation
│   │   └── errorHandler.ts
│   ├── routes/           # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── recordings.routes.ts
│   │   └── users.routes.ts
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   │   ├── errors.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── validation.ts
│   └── server.ts         # Express app setup
├── prisma/
│   └── schema.prisma     # Database schema
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Compile TypeScript
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI

# Code Quality
npm run lint             # Run ESLint
npm test                 # Run tests
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

Error Response Format:
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Proprietary - All rights reserved
