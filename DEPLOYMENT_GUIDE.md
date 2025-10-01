# FieldLink v5 - Deployment Guide

## Overview
This guide will help you deploy FieldLink v5 to production with the ability to update files through Claude.

---

## Recommended Architecture

```
GitHub Repository (source code)
    ↓
    ├─→ Vercel (Frontend - React)
    ├─→ Render (Backend - Node.js/Express)
    └─→ Neon/Supabase (PostgreSQL Database)
```

---

## Prerequisites

1. GitHub account
2. Vercel account (free tier: https://vercel.com)
3. Render account (free tier: https://render.com)
4. PostgreSQL database (Neon or Supabase free tier)

---

## Step 1: Push to GitHub

### A. Create a new repository on GitHub:
1. Go to https://github.com/new
2. Name: `fieldlink-v5` (or your preferred name)
3. Make it **Private** (keep your code secure)
4. Don't initialize with README (we already have files)

### B. Push your code:

```bash
cd "/Users/davidwright/Desktop/untitled folder/FieldLink v5"

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: FieldLink v5 with React Query caching"

# Add remote (replace USERNAME and REPO with your values)
git remote add origin https://github.com/USERNAME/fieldlink-v5.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Database (PostgreSQL)

### Option A: Neon (Recommended - Serverless PostgreSQL)

1. Go to https://neon.tech
2. Sign up (free tier: 0.5GB storage)
3. Create a new project: "fieldlink-v5"
4. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb
   ```
5. Save this for Step 3

### Option B: Supabase

1. Go to https://supabase.com
2. Create new project: "fieldlink-v5"
3. Go to Project Settings → Database
4. Copy "Connection string" (URI format)
5. Save this for Step 3

---

## Step 3: Deploy Backend (Render)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your `fieldlink-v5` repository
5. Configure:

```yaml
Name: fieldlink-v5-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npx prisma generate && npx prisma migrate deploy
Start Command: npm start
Instance Type: Free
```

6. Add Environment Variables:

```env
NODE_ENV=production
PORT=5001

# Database (from Step 2)
DATABASE_URL=postgresql://your-connection-string-here

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=fieldlink-recordings

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-123456

# Frontend URL (will update after Step 4)
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy the backend URL: `https://fieldlink-v5-backend.onrender.com`

---

## Step 4: Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your `fieldlink-v5` repository
4. Configure:

```yaml
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Add Environment Variables:

```env
# Backend API URL (from Step 3)
VITE_API_URL=https://fieldlink-v5-backend.onrender.com

# Optional: Analytics, Error Tracking, etc.
# VITE_SENTRY_DSN=your-sentry-dsn
```

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Copy your frontend URL: `https://fieldlink-v5.vercel.app`

---

## Step 5: Update CORS Configuration

1. Go back to Render dashboard
2. Find your backend service
3. Go to Environment
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://fieldlink-v5.vercel.app
   ```
5. Save and redeploy

---

## Step 6: Run Database Migrations

The migrations should run automatically during deployment, but if needed:

```bash
# In your local terminal
DATABASE_URL="your-production-database-url" npm run prisma:migrate
```

---

## Step 7: Share Repository with Claude

### To enable Claude to update your code:

1. **Make repository accessible to Claude:**
   - Go to your GitHub repository
   - Click "Settings" → "Collaborators"
   - Or keep it private and just reference files by path in Claude conversations

2. **For Claude to make updates:**
   - Share your GitHub repository URL with Claude in conversation
   - Claude can read public repos directly
   - For private repos, you can copy/paste code sections for Claude to edit
   - After Claude provides updates, commit and push:

```bash
git add .
git commit -m "Update: [describe changes]"
git push
```

3. **Auto-deployment will trigger:**
   - Vercel: Deploys automatically on every push to main
   - Render: Deploys automatically on every push to main

---

## How to Update Files Through Claude

### Method 1: Direct Repository Access (Public Repos)
1. Tell Claude: "Check my repository at https://github.com/USERNAME/fieldlink-v5"
2. Ask Claude to make changes: "Update the Dashboard to show X"
3. Claude will provide the code changes
4. Apply changes and push:
   ```bash
   git add .
   git commit -m "Feature: Added X to Dashboard"
   git push
   ```
5. Vercel/Render auto-deploy (30 seconds - 2 minutes)

### Method 2: Code Sharing (Private Repos)
1. Copy file contents from your local editor
2. Share with Claude: "Here's my DashboardPage.tsx, please add feature X"
3. Claude provides updated code
4. Copy back to your file
5. Commit and push (auto-deploys)

### Method 3: Using Claude Code CLI (Current Session)
1. Already set up! Your current Claude Code session
2. Ask Claude to make changes
3. Claude modifies files directly
4. Commit and push when ready

---

## Monitoring & Logs

### Frontend (Vercel):
- Go to https://vercel.com/dashboard
- Click your project → "Deployments"
- View logs for each deployment

### Backend (Render):
- Go to https://dashboard.render.com
- Click your service → "Logs"
- View real-time logs

### Database:
- Neon: https://console.neon.tech (Query Editor, Metrics)
- Supabase: https://app.supabase.com (Table Editor, SQL Editor)

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Upgrade Cost |
|---------|-----------|--------------|
| **Vercel** | 100GB bandwidth/month | $20/month Pro |
| **Render** | 750 hours/month | $7/month Starter |
| **Neon** | 0.5GB storage, 3 projects | $19/month Scale |
| **AWS S3** | 5GB storage, 20k GET requests | Pay-as-you-go |
| **OpenAI** | Pay-per-use | ~$0.51 per recording |

**Total Free:** ~$0.51 per recording (OpenAI only)  
**Total Paid (for scale):** ~$46/month + OpenAI costs

---

## Production Checklist

- [ ] Database deployed and migrated
- [ ] Backend deployed with all env vars
- [ ] Frontend deployed and pointing to backend
- [ ] CORS configured correctly
- [ ] OpenAI API key configured
- [ ] AWS S3 configured
- [ ] Test user registration
- [ ] Test recording upload
- [ ] Test transcription (will cost $0.06)
- [ ] Test analysis (will cost $0.45)
- [ ] Verify caching is working (no duplicate API calls)
- [ ] Set up domain (optional: `app.fieldlink.com`)

---

## Custom Domain Setup (Optional)

### Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your domain: `app.yourcompany.com`
3. Follow DNS instructions
4. SSL auto-configured

### Render (Backend):
1. Upgrade to Starter plan ($7/month for custom domains)
2. Go to Settings → Custom Domain
3. Add: `api.yourcompany.com`
4. Update VITE_API_URL in Vercel

---

## Backup Strategy

### Database Backups:
- **Neon**: Automatic daily backups (retained 7 days on free tier)
- **Supabase**: Automatic daily backups (retained 7 days)
- **Manual**: Run this weekly:
  ```bash
  pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
  ```

### Code Backups:
- Already backed up in GitHub
- Enable branch protection on main
- Consider weekly tags:
  ```bash
  git tag -a v1.0.0 -m "Production release"
  git push origin v1.0.0
  ```

---

## Scaling Considerations

### When you hit limits:

1. **Frontend (Vercel free tier: 100GB bandwidth)**
   - Upgrade to Pro: $20/month for 1TB

2. **Backend (Render free tier: 750 hours/month)**
   - Upgrade to Starter: $7/month for always-on
   - Or: Switch to Railway ($5/month minimum)

3. **Database (0.5GB storage)**
   - Neon Scale: $19/month for 10GB
   - Or: Self-hosted PostgreSQL on Render ($7/month)

4. **S3 Storage (5GB free)**
   - AWS charges: ~$0.023/GB/month after free tier
   - 100GB storage = ~$2.30/month

---

## Security Best Practices

1. **Never commit .env files** (already in .gitignore)
2. **Use strong JWT_SECRET** (random 64+ characters)
3. **Rotate API keys quarterly**
4. **Enable 2FA on GitHub, Vercel, Render**
5. **Review Vercel/Render access logs monthly**
6. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   ```

---

## Troubleshooting

### Backend won't start:
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Ensure Prisma migrations ran: `npx prisma migrate deploy`

### Frontend can't connect to backend:
- Check VITE_API_URL is correct
- Verify CORS_ORIGIN includes your frontend URL
- Check Network tab in browser DevTools

### Database connection errors:
- Verify DATABASE_URL format
- Check database is not paused (Neon/Supabase)
- Ensure SSL is enabled in connection string

### OpenAI API errors:
- Verify OPENAI_API_KEY is valid
- Check API usage limits
- Ensure billing is set up on OpenAI account

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## Quick Deploy Commands

```bash
# Update and deploy in one command
git add . && git commit -m "Update: [your change]" && git push

# Both Vercel and Render will auto-deploy!
# Frontend: ~30 seconds
# Backend: ~2 minutes
```

---

Generated: $(date)
FieldLink v5 - AI-Powered Conversation Analysis Platform
