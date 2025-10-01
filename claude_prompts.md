# FieldLink v5: Complete Claude Prompts
## Copy and Paste These Prompts to Build Your App

### Phase 1: Project Setup (Week 1)

#### Prompt 1: Initial Project Setup
```
I want to build FieldLink v5, a conversation recording and analysis platform for trades businesses (roofing, plumbing, HVAC). 

Please help me:
1. Set up a React project with TypeScript
2. Install Tailwind CSS, React Router, and essential dependencies
3. Create a proper folder structure (components, pages, hooks, services)
4. Set up the main App component with routing
5. Create a simple landing page

Please provide all the code files and explain what each one does.
```

#### Prompt 2: Design System Setup
```
Create a professional design system for FieldLink v5. I need:

1. Color palette suitable for trades industry (professional blues, grays, accent colors)
2. Typography system with proper font sizes and weights
3. Spacing system for consistent layouts
4. Base Button component with variants (primary, secondary, outline) and sizes (sm, md, lg)
5. Base Input component with validation states
6. Base Card component for content containers

Use React, TypeScript, and Tailwind CSS. Make it look modern and professional.
```

#### Prompt 3: Layout Components
```
Create the main layout components for FieldLink v5:

1. Header component with logo, navigation, and user menu
2. Sidebar component for navigation (Dashboard, Recordings, Analytics, Management)
3. PageLayout component that wraps pages with header and sidebar
4. Footer component

Make it responsive and professional looking for trades business owners.
```

### Phase 2: Authentication System (Week 2)

#### Prompt 4: Authentication Pages
```
Create the authentication system for FieldLink v5:

1. Login page with email/password fields and validation
2. Signup page with company information (name, industry, size)
3. Forgot password page
4. Reset password page

Include form validation, error handling, and professional styling. Use React Hook Form for form management.
```

#### Prompt 5: Authentication Logic
```
Create the authentication logic for FieldLink v5:

1. AuthContext for managing user state
2. useAuth hook for authentication functions
3. ProtectedRoute component for securing pages
4. Login/logout functionality
5. Token management

Include proper error handling and loading states.
```

### Phase 3: Dashboard (Week 3)

#### Prompt 6: Main Dashboard
```
Create the main dashboard for FieldLink v5:

1. Overview metrics cards (Total Recordings, Conversion Rate, Customer Satisfaction, Revenue Impact)
2. Recent recordings list with status and quick actions
3. Performance chart showing trends over time
4. Quick actions section (Start Recording, View Analytics, Manage Team)
5. Recent activity feed

Make it responsive and include placeholder data for now.
```

#### Prompt 7: Dashboard Components
```
Create the main dashboard for FieldLink v5:

1. Overview metrics cards (Total Recordings, Conversion Rate, Customer Satisfaction, Revenue Impact)
2. Recent recordings list with status and quick actions
3. Performance chart showing trends over time
4. Quick actions section (Start Recording, View Analytics, Manage Team)
5. Recent activity feed

Make it responsive and include placeholder data for now.
```

### Phase 4: Recording Features (Week 4)

#### Prompt 8: Recording Components
```
Create the recording functionality for FieldLink v5:

1. AudioRecorder component that can start/stop recording
2. RecordingList component showing all recordings
3. RecordingPlayer component for playing back recordings
4. RecordingUpload component for uploading audio files
5. Recording status indicators (recording, processing, completed)

Focus on the UI first - we'll add actual audio functionality later.
```

#### Prompt 9: Recording Pages
```
Create the recording pages for FieldLink v5:

1. RecordingPage - main recording interface
2. RecordingHistoryPage - list of all recordings
3. RecordingDetailPage - detailed view of a single recording
4. RecordingUploadPage - upload existing audio files

Include proper navigation, loading states, and error handling.
```

### Phase 5: Analytics (Week 5)

#### Prompt 10: Analytics Components
```
Create analytics components for FieldLink v5:

1. SentimentChart component showing conversation sentiment over time
2. ProcessScore component displaying adherence to sales processes
3. OpportunityList component showing sales opportunities
4. ActionItems component for follow-up recommendations
5. Analytics dashboard with multiple charts and metrics

Use placeholder data and make it visually appealing.
```

#### Prompt 11: Analytics Pages
```
Create analytics pages for FieldLink v5:

1. AnalyticsPage - main analytics dashboard
2. ConversationAnalysisPage - detailed conversation analysis
3. SentimentAnalysisPage - sentiment trends and insights
4. ProcessAdherencePage - sales process compliance
5. SalesOpportunitiesPage - identified opportunities

Include filters, date ranges, and export functionality.
```

### Phase 6: Management Features (Week 6)

#### Prompt 12: Management Components
```
Create management components for FieldLink v5:

1. ProcessTemplateForm for creating custom sales processes
2. UserManagementTable for managing team members
3. SettingsForm for company settings
4. ReportsGenerator for creating custom reports
5. TeamPerformanceChart for tracking team metrics

Make it professional and easy to use for business owners.
```

#### Prompt 13: Management Pages
```
Create management pages for FieldLink v5:

1. ManagementPage - main management dashboard
2. ProcessTemplatesPage - manage sales process templates
3. UserManagementPage - manage team members and permissions
4. SettingsPage - company settings and preferences
5. ReportsPage - generate and view reports

Include proper forms, tables, and data management.
```

### Phase 7: Backend API (Week 7)

#### Prompt 14: Backend Setup
```
Create the backend API for FieldLink v5:

1. Express.js server with TypeScript
2. Database models (User, Organization, Recording, Transcription, Analysis)
3. Authentication middleware
4. API routes structure
5. Error handling and validation

Use PostgreSQL for the database and include proper security measures.
```

#### Prompt 15: API Endpoints
```
Create the API endpoints for FieldLink v5:

1. Authentication endpoints (login, signup, logout)
2. User management endpoints
3. Recording endpoints (upload, list, get details)
4. Analytics endpoints (get analysis results, generate reports)
5. Management endpoints (process templates, settings)

Include proper validation, error handling, and documentation.
```

### Phase 8: AI Integration (Week 8)

#### Prompt 16: AI Analysis Service
```
Create the AI analysis service for FieldLink v5:

1. Transcription service using Google Cloud Speech-to-Text
2. Sentiment analysis using OpenAI GPT-4
3. Process adherence analysis
4. Sales opportunity detection
5. Action item generation

Include proper error handling and fallback options.
```

#### Prompt 17: Real-time Features
```
Create real-time features for FieldLink v5:

1. WebSocket service for live updates
2. Real-time recording status updates
3. Live analysis progress indicators
4. Notification system for completed analyses
5. Real-time dashboard updates

Use Socket.io for WebSocket functionality.
```

### Phase 9: Mobile App (Week 9)

#### Prompt 18: Mobile Components
```
Create the mobile app for FieldLink v5:

1. React Native project setup
2. Mobile navigation structure
3. Recording screen with audio capture
4. Dashboard screen with key metrics
5. Analytics screen with charts

Focus on the core functionality and make it work well on mobile devices.
```

#### Prompt 19: Mobile Features
```
Complete the mobile app for FieldLink v5:

1. Audio recording functionality
2. Offline storage and sync
3. Push notifications
4. Mobile-optimized UI
5. Background recording support

Ensure it works well for field technicians.
```

### Phase 10: Testing & Deployment (Week 10)

#### Prompt 20: Testing Setup
```
Set up testing for FieldLink v5:

1. Unit tests for components
2. Integration tests for API endpoints
3. End-to-end tests for critical user flows
4. Test data and fixtures
5. Testing documentation

Use Jest, React Testing Library, and Supertest.
```

#### Prompt 21: Deployment
```
Set up deployment for FieldLink v5:

1. Docker configuration
2. CI/CD pipeline
3. Environment configuration
4. Database migrations
5. Production deployment guide

Include proper monitoring and error tracking.
```

---

## How to Use These Prompts

### Step 1: Start with Prompt 1
Copy and paste the first prompt into Claude and follow the instructions.

### Step 2: Test Each Feature
After Claude provides the code, test it to make sure it works before moving to the next prompt.

### Step 3: Ask for Modifications
If you want to change something, ask Claude to modify the code:
```
"Please modify the Button component to include a loading state and disabled state."
```

### Step 4: Get Explanations
If you don't understand something, ask:
```
"Can you explain how the authentication context works and why it's needed?"
```

### Step 5: Debug Issues
If something doesn't work, ask:
```
"The login form isn't working. Here's the error: [paste error]. Please help me fix it."
```

---

## Pro Tips

1. **Copy the exact prompts** - don't modify them
2. **Test each feature** before moving to the next
3. **Ask questions** when you don't understand
4. **Request modifications** if you want changes
5. **Build incrementally** - one feature at a time

---

## Ready to Start?

Copy and paste **Prompt 1** into Claude and begin building your FieldLink v5 application!
