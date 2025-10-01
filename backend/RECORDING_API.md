# Recording Management API Documentation

## Overview
Comprehensive API endpoints for managing audio recordings, transcriptions, and file uploads in FieldLink v5.

## Base URLs
- Development: `http://localhost:5000/api`
- v1 Endpoints: `http://localhost:5000/api/v1`

## Authentication
All endpoints require Bearer token authentication unless specified otherwise.

```
Authorization: Bearer <your-token>
```

---

## Recording Endpoints

### 1. Upload Recording
Upload an audio file to S3 and create recording metadata.

**Endpoint:** `POST /api/recordings/upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): Audio file (mp3, wav, m4a, ogg) - Max 100MB
- `title` (optional): Recording title (defaults to filename)

**Supported Audio Formats:**
- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- OGG (.ogg)

**File Size Limit:** 100MB

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Sales Call 2024-01-15",
    "duration": 0,
    "fileSize": 5242880,
    "s3Key": "recordings/org-id/1234567890-filename.mp3",
    "s3Url": "https://s3.amazonaws.com/bucket/...",
    "status": "UPLOADED",
    "userId": "uuid",
    "organizationId": "uuid",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  },
  "message": "Recording uploaded successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file type or size
- `401 Unauthorized`: Missing or invalid token
- `503 Service Unavailable`: S3 not configured

---

### 2. Get All Recordings
Retrieve paginated list of recordings.

**Endpoint:** `GET /api/recordings`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `order` (optional): Sort order - asc/desc (default: desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Sales Call",
      "duration": 1800,
      "fileSize": 5242880,
      "status": "COMPLETED",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "user": {...},
      "transcription": {
        "id": "uuid",
        "confidence": 0.95,
        "language": "en-US"
      },
      "analysisResult": {
        "id": "uuid",
        "confidence": 0.88
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 3. Get Single Recording
Retrieve detailed information about a specific recording.

**Endpoint:** `GET /api/recordings/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Sales Call",
    "duration": 1800,
    "fileSize": 5242880,
    "s3Key": "recordings/org-id/file.mp3",
    "s3Url": "https://...",
    "status": "COMPLETED",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "user": {...},
    "transcription": {
      "id": "uuid",
      "content": "Full transcription text...",
      "confidence": 0.95,
      "language": "en-US"
    },
    "analysisResult": {
      "id": "uuid",
      "sentiment": "POSITIVE",
      "opportunities": [...],
      "processAdherence": {...}
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Recording doesn't exist or doesn't belong to organization

---

### 4. Create Recording Metadata
Create recording metadata after manual upload (alternative to upload endpoint).

**Endpoint:** `POST /api/recordings`

**Request Body:**
```json
{
  "title": "Sales Call",
  "duration": 1800,
  "fileSize": 5242880,
  "s3Key": "recordings/org-id/file.mp3",
  "s3Url": "https://..."
}
```

**Response:** `201 Created`

---

### 5. Update Recording
Update recording details.

**Endpoint:** `PATCH /api/recordings/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "COMPLETED"
}
```

**Status Values:**
- `UPLOADED`: File uploaded, not processed
- `TRANSCRIBING`: Currently being transcribed
- `ANALYZING`: Currently being analyzed
- `COMPLETED`: All processing complete
- `FAILED`: Processing failed

**Response:** `200 OK`

---

### 6. Delete Recording
Delete recording and associated data from database and S3.

**Endpoint:** `DELETE /api/recordings/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Recording deleted successfully"
}
```

**Note:** This permanently deletes:
- Recording metadata from database
- Audio file from S3
- Associated transcription
- Associated analysis results

---

### 7. Get Recording Statistics
Get aggregated statistics for organization's recordings.

**Endpoint:** `GET /api/recordings/stats`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRecordings": 145,
    "recordingsByStatus": [
      { "status": "COMPLETED", "count": 120 },
      { "status": "UPLOADED", "count": 15 },
      { "status": "TRANSCRIBING", "count": 8 },
      { "status": "FAILED", "count": 2 }
    ],
    "totalStorage": 524288000,
    "totalDuration": 261000,
    "recordingsByDate": {
      "2024-01-15": 12,
      "2024-01-14": 8,
      "2024-01-13": 15
    }
  }
}
```

**Storage:** Total storage in bytes
**Duration:** Total duration in seconds
**RecordingsByDate:** Last 30 days of activity

---

### 8. Get Recordings by Date Range
Filter recordings by date range with pagination.

**Endpoint:** `GET /api/recordings/date-range`

**Query Parameters:**
- `startDate` (required): ISO date string (e.g., "2024-01-01")
- `endDate` (required): ISO date string (e.g., "2024-01-31")
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sortBy` (optional): Field to sort by
- `order` (optional): Sort order

**Example:**
```
GET /api/recordings/date-range?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...],
  "pagination": {...},
  "dateRange": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  }
}
```

---

## Transcription Endpoints

### 9. Get Transcription for Recording
Retrieve transcription for a specific recording.

**Endpoint:** `GET /api/recordings/:id/transcription`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Full transcription text of the conversation...",
    "language": "en-US",
    "confidence": 0.95,
    "segments": "[{\"text\":\"Hello\",\"startTime\":0,\"endTime\":1.5,\"confidence\":0.98}]",
    "recordingId": "uuid",
    "processedAt": "2024-01-15T10:05:00.000Z",
    "recording": {
      "id": "uuid",
      "title": "Sales Call",
      "duration": 1800,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Recording or transcription not found

---

### 10. Create/Update Transcription
Create or update transcription for a recording.

**Endpoint:** `POST /api/recordings/:id/transcription`

**Request Body:**
```json
{
  "content": "Full transcription text...",
  "language": "en-US",
  "confidence": 0.95,
  "segments": [
    {
      "text": "Hello, how can I help you today?",
      "startTime": 0,
      "endTime": 2.5,
      "confidence": 0.98
    },
    {
      "text": "I'm interested in your product.",
      "startTime": 2.5,
      "endTime": 5.0,
      "confidence": 0.96
    }
  ]
}
```

**Response:** `201 Created` (new) or `200 OK` (update)

**Note:** This endpoint automatically updates recording status to "COMPLETED"

---

### 11. Search Transcriptions
Search across all transcriptions for your organization.

**Endpoint:** `GET /api/transcriptions/search`

**Query Parameters:**
- `query` (required): Search term
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example:**
```
GET /api/transcriptions/search?query=pricing&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Full transcription...",
      "matches": [
        "...interested in your <mark>pricing</mark> options...",
        "...the <mark>pricing</mark> structure is flexible..."
      ],
      "matchCount": 3,
      "recording": {
        "id": "uuid",
        "title": "Sales Call",
        "user": {...}
      }
    }
  ],
  "pagination": {...},
  "query": "pricing"
}
```

**Features:**
- Case-insensitive search
- Context snippets with highlighted matches
- Match count per transcription
- Sorted by most recent

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service not configured

---

## File Upload Guidelines

### Supported Formats
- **MP3**: Most common, good compression
- **WAV**: Uncompressed, high quality
- **M4A**: Apple audio format
- **OGG**: Open source format

### Size Limits
- Maximum file size: **100MB**
- Files larger than 100MB will be rejected

### Best Practices
1. Use MP3 for best compression/quality ratio
2. Recommended bitrate: 64-128 kbps for voice
3. Sample rate: 16kHz or higher
4. Mono audio is sufficient for voice

---

## S3 Configuration

The upload service requires AWS S3 credentials in environment variables:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=fieldlink-recordings
```

**Note:** If S3 is not configured, upload endpoints will return 503 Service Unavailable error.

### S3 Folder Structure
```
recordings/
  ├── {organization-id}/
  │   ├── {timestamp}-{filename}.mp3
  │   ├── {timestamp}-{filename}.wav
  │   └── ...
```

---

## Rate Limiting

API requests are rate-limited:
- **100 requests per 15 minutes** per IP address
- Exceeding limit returns 429 Too Many Requests

---

## Webhooks & Real-time Updates

Socket.IO events for real-time updates:

```javascript
socket.emit('join-organization', organizationId)

// Listen for events
socket.on('recording:uploaded', (data) => { })
socket.on('recording:transcribed', (data) => { })
socket.on('recording:analyzed', (data) => { })
```

---

## TypeScript Support

Full TypeScript types available in `/src/types/api.ts`:

```typescript
import {
  RecordingResponse,
  TranscriptionResponse,
  UploadRecordingRequest
} from './types/api'
```

---

## Examples

### Upload Recording with Fetch
```javascript
const formData = new FormData()
formData.append('file', audioFile)
formData.append('title', 'My Recording')

const response = await fetch('/api/recordings/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})

const result = await response.json()
```

### Search Transcriptions
```javascript
const response = await fetch(
  '/api/transcriptions/search?query=pricing&page=1',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)

const results = await response.json()
```

---

## Support

For issues or questions:
- GitHub Issues: [Link to repository]
- Email: support@fieldlink.com
- Documentation: /api/docs

---

**Version:** 5.0.0
**Last Updated:** 2024-01-15
