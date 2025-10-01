# FieldLink v5 API Reference

## Overview

Welcome to the FieldLink v5 API documentation. This API provides comprehensive tools for audio recording management, speech-to-text transcription, AI-powered conversation analysis, sales opportunity detection, sentiment analysis, and process adherence scoring.

**Base URL:** `http://localhost:5000/api/v1`

**API Version:** 5.0.0

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Pagination](#pagination)
4. [Error Handling](#error-handling)
5. [Authentication Endpoints](#authentication-endpoints)
6. [User Management](#user-management)
7. [Recording Management](#recording-management)
8. [System Endpoints](#system-endpoints)

---

## Authentication

FieldLink v5 uses JWT (JSON Web Token) based authentication. After successful login, you'll receive a token that must be included in subsequent requests.

### Authentication Flow

```
┌─────────┐                    ┌─────────┐
│ Client  │                    │  Server │
└────┬────┘                    └────┬────┘
     │                              │
     │  POST /auth/register         │
     │  (email, password, name)     │
     ├─────────────────────────────>│
     │                              │
     │  { token, user }             │
     │<─────────────────────────────┤
     │                              │
     │  POST /auth/login            │
     │  (email, password)           │
     ├─────────────────────────────>│
     │                              │
     │  { token, user }             │
     │<─────────────────────────────┤
     │                              │
     │  GET /users                  │
     │  Authorization: Bearer token │
     ├─────────────────────────────>│
     │                              │
     │  { users: [...] }            │
     │<─────────────────────────────┤
     │                              │
```

### Using Authentication Tokens

Include the JWT token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your-jwt-token>
```

**Token Expiration:** Tokens expire after 7 days by default. After expiration, users must log in again.

---

## Rate Limiting

To ensure fair usage and prevent abuse, the API implements rate limiting:

- **Window:** 15 minutes
- **Max Requests:** 100 requests per window
- **Scope:** Per IP address

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": {
    "message": "Too many requests from this IP, please try again later.",
    "status": 429
  }
}
```

---

## Pagination

List endpoints support pagination using query parameters:

**Query Parameters:**
- `page` (number, default: 1) - Page number to retrieve
- `limit` (number, default: 10, max: 100) - Number of items per page

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

## Error Handling

All errors follow a consistent format:

**Error Response Structure:**
```json
{
  "error": {
    "message": "Error description",
    "status": 400,
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes

| Status Code | Description |
|------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

---

## Authentication Endpoints

### Register New User

Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "role": "USER"
}
```

**Request Fields:**
- `email` (string, required) - Valid email address
- `password` (string, required) - Minimum 8 characters, must include uppercase, lowercase, and number
- `name` (string, required) - User's full name
- `role` (string, optional) - User role: USER, MANAGER, or ADMIN (default: USER)

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc456",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-10-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": {
    "message": "User with this email already exists",
    "status": 400,
    "code": "USER_EXISTS"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

**TypeScript Fetch Example:**
```typescript
const response = await fetch('http://localhost:5000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    name: 'John Doe'
  })
})

const data = await response.json()
if (data.success) {
  // Store token for future requests
  localStorage.setItem('token', data.data.token)
}
```

---

### Login

Authenticate with email and password to receive a JWT token.

**Endpoint:** `POST /api/v1/auth/login`

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Request Fields:**
- `email` (string, required) - User's email address
- `password` (string, required) - User's password

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc456",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-10-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": {
    "message": "Invalid email or password",
    "status": 401,
    "code": "INVALID_CREDENTIALS"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**TypeScript Fetch Example:**
```typescript
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
})

const data = await response.json()
if (data.success) {
  localStorage.setItem('token', data.data.token)
  console.log('Logged in as:', data.data.user.name)
}
```

---

### Get Current User

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /api/v1/auth/me`

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc456",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "organizationId": "clx789xyz012",
      "createdAt": "2025-10-01T10:30:00.000Z",
      "updatedAt": "2025-10-01T10:30:00.000Z"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": {
    "message": "No authentication token provided",
    "status": 401,
    "code": "NO_TOKEN"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**TypeScript Fetch Example:**
```typescript
const token = localStorage.getItem('token')

const response = await fetch('http://localhost:5000/api/v1/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const data = await response.json()
if (data.success) {
  console.log('Current user:', data.data.user)
}
```

---

## User Management

### Get All Users

Retrieve a paginated list of all users.

**Endpoint:** `GET /api/v1/users`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 10, max: 100) - Items per page
- `search` (string, optional) - Search by name or email
- `role` (string, optional) - Filter by role: USER, MANAGER, or ADMIN

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123abc456",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "organizationId": "clx789xyz012",
      "createdAt": "2025-10-01T10:30:00.000Z",
      "updatedAt": "2025-10-01T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**TypeScript Fetch Example:**
```typescript
const token = localStorage.getItem('token')

const response = await fetch('http://localhost:5000/api/v1/users?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const data = await response.json()
if (data.success) {
  data.data.forEach(user => {
    console.log(`${user.name} (${user.email})`)
  })
}
```

---

### Get User by ID

Retrieve detailed information about a specific user.

**Endpoint:** `GET /api/v1/users/:id`

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `id` (string, required) - User ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "organizationId": "clx789xyz012",
    "createdAt": "2025-10-01T10:30:00.000Z",
    "updatedAt": "2025-10-01T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": {
    "message": "User not found",
    "status": 404,
    "code": "USER_NOT_FOUND"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/v1/users/clx123abc456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update User

Update user information.

**Endpoint:** `PATCH /api/v1/users/:id`

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `id` (string, required) - User ID

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "MANAGER"
}
```

**Request Fields (all optional):**
- `name` (string) - User's full name
- `email` (string) - Valid email address
- `role` (string) - User role: USER, MANAGER, or ADMIN

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "MANAGER",
    "organizationId": "clx789xyz012",
    "updatedAt": "2025-10-01T11:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:5000/api/v1/users/clx123abc456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "role": "MANAGER"
  }'
```

**TypeScript Fetch Example:**
```typescript
const token = localStorage.getItem('token')
const userId = 'clx123abc456'

const response = await fetch(`http://localhost:5000/api/v1/users/${userId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Jane Doe',
    role: 'MANAGER'
  })
})

const data = await response.json()
if (data.success) {
  console.log('User updated:', data.data)
}
```

---

### Delete User

Delete a user account (Admin only).

**Endpoint:** `DELETE /api/v1/users/:id`

**Authentication:** Required (Bearer Token - Admin role)

**URL Parameters:**
- `id` (string, required) - User ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": {
    "message": "Insufficient permissions",
    "status": 403,
    "code": "FORBIDDEN"
  }
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/v1/users/clx123abc456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Recording Management

### Get All Recordings

Retrieve a paginated list of audio recordings.

**Endpoint:** `GET /api/v1/recordings`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 10, max: 100) - Items per page
- `status` (string, optional) - Filter by status: PENDING, PROCESSING, COMPLETED, FAILED
- `userId` (string, optional) - Filter by user ID
- `startDate` (string, optional) - Filter by date (ISO 8601 format)
- `endDate` (string, optional) - Filter by date (ISO 8601 format)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx456def789",
      "title": "Sales Call - ABC Corp",
      "description": "Follow-up call with potential client",
      "audioUrl": "https://storage.example.com/recordings/abc123.mp3",
      "duration": 1845,
      "status": "COMPLETED",
      "userId": "clx123abc456",
      "organizationId": "clx789xyz012",
      "transcriptionId": "clx999ttt111",
      "createdAt": "2025-10-01T09:00:00.000Z",
      "updatedAt": "2025-10-01T09:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/v1/recordings?page=1&limit=10&status=COMPLETED" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**TypeScript Fetch Example:**
```typescript
const token = localStorage.getItem('token')

const params = new URLSearchParams({
  page: '1',
  limit: '10',
  status: 'COMPLETED'
})

const response = await fetch(`http://localhost:5000/api/v1/recordings?${params}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const data = await response.json()
if (data.success) {
  data.data.forEach(recording => {
    console.log(`${recording.title} - ${recording.duration}s`)
  })
}
```

---

### Get Recording by ID

Retrieve detailed information about a specific recording.

**Endpoint:** `GET /api/v1/recordings/:id`

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `id` (string, required) - Recording ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx456def789",
    "title": "Sales Call - ABC Corp",
    "description": "Follow-up call with potential client",
    "audioUrl": "https://storage.example.com/recordings/abc123.mp3",
    "duration": 1845,
    "status": "COMPLETED",
    "userId": "clx123abc456",
    "organizationId": "clx789xyz012",
    "transcriptionId": "clx999ttt111",
    "metadata": {
      "fileSize": 2456789,
      "format": "audio/mpeg",
      "sampleRate": 44100
    },
    "createdAt": "2025-10-01T09:00:00.000Z",
    "updatedAt": "2025-10-01T09:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": {
    "message": "Recording not found",
    "status": 404,
    "code": "RECORDING_NOT_FOUND"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/v1/recordings/clx456def789 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Create Recording

Upload and create a new audio recording.

**Endpoint:** `POST /api/v1/recordings`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "title": "Sales Call - XYZ Company",
  "description": "Initial discovery call",
  "audioUrl": "https://storage.example.com/uploads/new-recording.mp3",
  "duration": 1200,
  "metadata": {
    "fileSize": 1500000,
    "format": "audio/mpeg",
    "sampleRate": 44100
  }
}
```

**Request Fields:**
- `title` (string, required) - Recording title
- `description` (string, optional) - Recording description
- `audioUrl` (string, required) - URL to the audio file
- `duration` (number, required) - Duration in seconds
- `metadata` (object, optional) - Additional metadata about the recording

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clx456def789",
    "title": "Sales Call - XYZ Company",
    "description": "Initial discovery call",
    "audioUrl": "https://storage.example.com/uploads/new-recording.mp3",
    "duration": 1200,
    "status": "PENDING",
    "userId": "clx123abc456",
    "organizationId": "clx789xyz012",
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/recordings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sales Call - XYZ Company",
    "description": "Initial discovery call",
    "audioUrl": "https://storage.example.com/uploads/new-recording.mp3",
    "duration": 1200
  }'
```

**TypeScript Fetch Example:**
```typescript
const token = localStorage.getItem('token')

const response = await fetch('http://localhost:5000/api/v1/recordings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Sales Call - XYZ Company',
    description: 'Initial discovery call',
    audioUrl: 'https://storage.example.com/uploads/new-recording.mp3',
    duration: 1200
  })
})

const data = await response.json()
if (data.success) {
  console.log('Recording created:', data.data.id)
}
```

---

### Update Recording

Update recording information.

**Endpoint:** `PATCH /api/v1/recordings/:id`

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `id` (string, required) - Recording ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

**Request Fields (all optional):**
- `title` (string) - Recording title
- `description` (string) - Recording description
- `status` (string) - Status: PENDING, PROCESSING, COMPLETED, FAILED

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx456def789",
    "title": "Updated Title",
    "description": "Updated description",
    "status": "COMPLETED",
    "updatedAt": "2025-10-01T11:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:5000/api/v1/recordings/clx456def789 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "COMPLETED"
  }'
```

---

### Delete Recording

Delete a recording and its associated data.

**Endpoint:** `DELETE /api/v1/recordings/:id`

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `id` (string, required) - Recording ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Recording deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": {
    "message": "Recording not found",
    "status": 404,
    "code": "RECORDING_NOT_FOUND"
  }
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/v1/recordings/clx456def789 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## System Endpoints

### Health Check

Check the API server health status.

**Endpoint:** `GET /health`

**Authentication:** None

**Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T12:00:00.000Z",
  "service": "FieldLink v5 - AI Conversation Analysis"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/health
```

---

### API Information

Get information about the API and its features.

**Endpoint:** `GET /api`

**Authentication:** None

**Success Response (200 OK):**
```json
{
  "message": "FieldLink v5 API",
  "version": "5.0.0",
  "features": [
    "Audio Recording Upload",
    "Speech-to-Text Transcription",
    "AI Conversation Analysis",
    "Sales Opportunity Detection",
    "Sentiment Analysis",
    "Process Adherence Scoring"
  ]
}
```

---

### List All Routes

Get a complete list of all available API routes.

**Endpoint:** `GET /api/routes`

**Authentication:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "version": "5.0.0",
  "totalRoutes": 15,
  "routes": [
    {
      "method": "POST",
      "path": "/api/v1/auth/register",
      "description": "Register a new user account",
      "authentication": "None",
      "version": "v1"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/routes
```

---

## Best Practices

### Security

1. **Never expose tokens** - Store JWT tokens securely (localStorage for web, secure storage for mobile)
2. **Use HTTPS in production** - Always use HTTPS to encrypt data in transit
3. **Rotate tokens regularly** - Implement token refresh mechanism for long-running sessions
4. **Validate input** - All input is validated on the server, but also validate on client-side for better UX

### Performance

1. **Use pagination** - Always paginate large datasets to reduce response size
2. **Cache responses** - Cache frequently accessed data on the client-side
3. **Compress requests** - Use gzip compression for large request bodies
4. **Batch operations** - Where possible, batch multiple operations into single requests

### Error Handling

1. **Check status codes** - Always check HTTP status codes before processing responses
2. **Handle rate limits** - Implement exponential backoff when hitting rate limits
3. **Log errors** - Log all errors for debugging and monitoring
4. **Show user-friendly messages** - Convert technical errors to user-friendly messages

---

## WebSocket Events

FieldLink v5 also supports real-time updates via WebSocket connections.

### Connection

```typescript
import io from 'socket.io-client'

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
})

socket.on('connect', () => {
  console.log('Connected to WebSocket')
})
```

### Available Events

- `recording:created` - Emitted when a new recording is created
- `recording:updated` - Emitted when a recording is updated
- `transcription:completed` - Emitted when transcription is completed
- `analysis:completed` - Emitted when AI analysis is completed

---

## Support

For support, issues, or feature requests:

- **Email:** support@fieldlink.com
- **GitHub:** https://github.com/fieldlink/v5
- **Documentation:** http://localhost:5000/api/docs

---

**Last Updated:** October 1, 2025

**API Version:** 5.0.0
