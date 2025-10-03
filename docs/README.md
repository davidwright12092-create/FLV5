# FieldLink v5

AI-powered conversation recording and analysis platform for trades businesses. Records, transcribes, and analyzes customer conversations to improve sales processes, detect opportunities, and optimize team performance.

## Overview

FieldLink v5 transforms how trades businesses understand and improve their customer interactions by:
- **Recording** customer conversations via mobile app
- **Transcribing** audio using Google Cloud Speech-to-Text
- **Analyzing** conversations with OpenAI GPT-4 for:
  - Sales process adherence scoring
  - Sentiment analysis
  - Sales opportunity detection
  - Automated action item generation

## Project Structure

```
FieldLink v5/
├── frontend/           # React web dashboard
│   ├── Dashboard with analytics
│   ├── Recording management
│   └── AI analysis visualization
├── backend/            # Node.js/Express API + AI services
│   ├── Audio upload & storage (AWS S3)
│   ├── Speech-to-text service
│   ├── AI analysis engine
│   └── Real-time WebSocket updates
├── mobile/             # React Native recording app
│   └── FieldLinkMobile/
└── docs/               # Technical documentation
```

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis (for caching)
- AWS Account (for S3 audio storage)
- OpenAI API key
- Google Cloud account (for Speech-to-Text)

## Getting Started

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Set Up Environment Variables

**Frontend (.env)**
```bash
cp frontend/.env.example frontend/.env
# Edit with your configuration
```

**Backend (.env)**
```bash
cp backend/.env.example backend/.env
# Add your API keys:
# - DATABASE_URL
# - AWS credentials
# - OPENAI_API_KEY
# - Google Cloud credentials
```

### 3. Set Up Database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Technologies

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (data fetching)
- Socket.IO (real-time updates)
- Recharts (analytics visualization)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Redis (caching)
- AWS S3 (audio storage)
- OpenAI GPT-4 (AI analysis)
- Google Cloud Speech-to-Text
- Socket.IO (real-time)

### Mobile
- React Native
- Audio recording capabilities
- Offline storage & sync
- Background recording

## Key Features

### 🎤 Audio Recording
- Mobile app for field technicians
- Background recording support
- Offline mode with auto-sync
- High-quality audio capture

### 📝 Transcription
- Google Cloud Speech-to-Text
- Speaker identification
- Custom vocabulary for trades industry
- Confidence scoring

### 🤖 AI Analysis
- **Process Adherence**: Score conversations against custom sales templates
- **Sentiment Analysis**: Customer satisfaction & technician performance
- **Opportunity Detection**: Pricing discussions, upsells, objections
- **Action Items**: Automated follow-up recommendations

### 📊 Analytics Dashboard
- Performance metrics & trends
- Team performance tracking
- Revenue opportunity insights
- Real-time notifications

## Documentation

- [Technical Architecture](./technical_architecture.md)
- [Development Plan](./development_plan.md)
- [Business Plan](./business_plan.md)

## License

MIT
