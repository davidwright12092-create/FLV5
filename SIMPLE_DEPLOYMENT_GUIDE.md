# 🚀 FieldLink v5 - Beginner's Deployment Guide

## What We're Building

Right now, your app only runs on your computer (localhost). We want to put it on the internet so:
- ✅ You can access it from anywhere
- ✅ Other people can use it
- ✅ You can update it through Claude whenever you want

---

## 🎯 The Big Picture (Super Simple)

Think of it like this:

**Your Computer (Right Now):**
```
Your App → Only you can see it at localhost:5173
```

**After Deployment:**
```
GitHub (Code Storage)
    ↓
Internet → app.fieldlink.com (everyone can see it)
    ↓
You make changes with Claude → Push button → Live in 30 seconds
```

---

## 📦 What You'll Need

1. **GitHub** - Stores your code (like Dropbox for code) - **FREE**
2. **Bluehost** (you already have!) - Hosts your website frontend - **Already Paid**
3. **Render** - Runs your backend server (the part that does the work) - **FREE**
4. **Supabase** - Stores your database (customer data, recordings, etc.) - **FREE**

**Total Setup Time:** ~30 minutes
**Monthly Cost:** $0 (just using what you already have!)

---

## 🪜 Step-by-Step Instructions

### Step 1: Put Your Code on GitHub (5 minutes)

**What is GitHub?**
Think of it as "Google Drive for code." When you update your code, you upload it to GitHub, and your website automatically updates.

**How to do it:**

1. **Go to GitHub:**
   - Visit: https://github.com/signup
   - Create a free account (use your email)

2. **Create a Repository (a "folder" for your code):**
   - Click the `+` button (top right) → "New repository"
   - Name it: `fieldlink-v5`
   - Make it **Private** (keep it secure)
   - Click "Create repository"

3. **Upload Your Code:**
   - Open your **Terminal** (the black window)
   - Copy and paste these commands ONE AT A TIME:

```bash
# 1. Go to your project folder
cd "/Users/davidwright/Desktop/untitled folder/FieldLink v5"

# 2. Prepare your code
git add .

# 3. Save your code with a message
git commit -m "Initial version - ready for deployment"

# 4. Connect to GitHub (REPLACE 'YourUsername' with your GitHub username)
git remote add origin https://github.com/YourUsername/fieldlink-v5.git

# 5. Upload to GitHub
git branch -M main
git push -u origin main
```

**🎉 Success looks like:** You can now see your code at `https://github.com/YourUsername/fieldlink-v5`

---

### Step 2: Set Up Your Database with Supabase (10 minutes)

**What is a Database?**
It stores all your customer data, recordings, and analysis results. Think of it like Excel, but on the internet.

**How to do it:**

1. **Go to Supabase:**
   - Visit: https://supabase.com
   - Click "Start your project" → Sign up with GitHub (easier!)
   - ✅ **FREE Forever** for your first project

2. **Create a New Project:**
   - Click "New Project"
   - **Organization:** Click "New organization" → Name it `FieldLink` → Click "Create organization"
   - **Name:** `fieldlink-v5`
   - **Database Password:** Create a strong password (SAVE THIS! You'll need it)
   - **Region:** Choose **East US (North Virginia)** (closest to most users)
   - Click "Create new project"
   - ⏱️ Wait 2-3 minutes while Supabase sets up your database

3. **Get Your Connection String:**
   - Click "Project Settings" (gear icon in sidebar)
   - Click "Database" in the left menu
   - Scroll down to **Connection String**
   - Select "URI" tab
   - You'll see something like:
     ```
     postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - Click "Copy" button
   - **REPLACE `[YOUR-PASSWORD]`** with the password you created in step 2
   - **SAVE THIS!** Paste it in a notes app - you'll need it in Step 3

**🎉 Success looks like:** You have a connection string that looks like `postgresql://postgres.xxxx:YourPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

**💡 Bonus Features You Get with Supabase:**
- Beautiful web interface to view your data (like Excel online)
- Automatic backups every day
- Built-in authentication (we're already using our own, but good to know!)
- 500MB free storage

---

### Step 3: Deploy Your Backend (10 minutes)

**What is the Backend?**
This is the "brain" of your app. It handles recordings, talks to OpenAI, and manages data.

**How to do it:**

1. **Go to Render:**
   - Visit: https://render.com
   - Click "Get Started" → Sign up with GitHub

2. **Connect Your Code:**
   - Click "New +" → "Web Service"
   - Click "Connect" next to your `fieldlink-v5` repository
   - Click "Connect"

3. **Configure Your Backend:**
   Fill in these fields:

   | Field | Value |
   |-------|-------|
   | **Name** | `fieldlink-backend` |
   | **Region** | Oregon (US West) |
   | **Branch** | main |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |

4. **Add Environment Variables:**
   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable" for each one below:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` |
   | `DATABASE_URL` | *Paste your Supabase connection string from Step 2* |
   | `OPENAI_API_KEY` | *Your OpenAI key (you already have this)* |
   | `AWS_ACCESS_KEY_ID` | *Your AWS key (you already have this)* |
   | `AWS_SECRET_ACCESS_KEY` | *Your AWS secret (you already have this)* |
   | `AWS_REGION` | `us-east-1` |
   | `AWS_S3_BUCKET` | `fieldlink-recordings` |
   | `JWT_SECRET` | `make-up-a-random-password-here-123456` |
   | `CORS_ORIGIN` | *Your Bluehost domain (we'll add this after Step 4)* |

5. **Click "Create Web Service"**

6. **Wait 5-10 minutes** (Render is setting up your server)

7. **Copy Your Backend URL:**
   - When it's done, you'll see: `https://fieldlink-backend.onrender.com`
   - **COPY THIS!** You'll need it in Step 4

**🎉 Success looks like:** Your backend URL works (you can click it)

---

### Step 4: Deploy Your Frontend to Bluehost (10 minutes)

**What is the Frontend?**
This is what users see - the beautiful dashboard, charts, and buttons.

**Since you have Bluehost, we'll use that instead of Vercel!**

**How to do it:**

1. **Build Your Frontend Locally:**
   - Open Terminal
   - Run these commands:

   ```bash
   # Go to frontend folder
   cd "/Users/davidwright/Desktop/untitled folder/FieldLink v5/frontend"

   # Create a .env file with your backend URL
   echo "VITE_API_URL=https://fieldlink-backend.onrender.com" > .env.production

   # Build the production files
   npm run build
   ```

   ✅ This creates a `dist` folder with your website files

2. **Upload to Bluehost:**

   **Option A: Using Bluehost File Manager (Easier for beginners)**

   - Log in to your Bluehost account: https://my.bluehost.com
   - Click "Advanced" → "File Manager"
   - Navigate to `public_html` folder (or create a subfolder like `public_html/fieldlink`)
   - Click "Upload" button
   - **Upload ALL files from:** `/Users/davidwright/Desktop/untitled folder/FieldLink v5/frontend/dist`
   - Drag and drop all files from the `dist` folder
   - Wait for upload to complete

   **Option B: Using FTP (If you're comfortable with it)**

   - Use an FTP client like FileZilla
   - Connect to your Bluehost account (get credentials from Bluehost dashboard)
   - Upload all files from `frontend/dist` to `public_html/fieldlink`

3. **Find Your Website URL:**

   If you have a domain with Bluehost:
   - **Your app will be at:** `https://yourdomain.com/fieldlink`
   - Or if you uploaded to root: `https://yourdomain.com`

   If you're using Bluehost's temporary URL:
   - **Your app will be at:** `https://yourusername.bluehost.com/fieldlink`

4. **Test It:**
   - Open your browser
   - Go to your website URL
   - You should see the FieldLink login page!

**🎉 Success looks like:** You can see your app at your Bluehost domain!

**⚠️ Important Note:**
Unlike Vercel which auto-deploys, with Bluehost you'll need to manually rebuild and re-upload when you make changes. Don't worry - I'll show you a simple script to make this easier!

---

### Step 5: Final Connection (2 minutes)

Your frontend and backend need to talk to each other. Let's connect them:

1. **Go back to Render:**
   - Find your backend service
   - Click "Environment"
   - Find `CORS_ORIGIN`
   - **Change it to your Bluehost domain:** (examples below)
     - If using custom domain: `https://yourdomain.com`
     - If using Bluehost temp URL: `https://yourusername.bluehost.com`
   - Click "Save Changes"
   - Wait 2 minutes for it to redeploy

2. **Update Backend URL in Frontend (if you move files later):**
   - If you ever change your Bluehost setup, just rebuild:
   ```bash
   cd "/Users/davidwright/Desktop/untitled folder/FieldLink v5/frontend"
   echo "VITE_API_URL=https://fieldlink-backend.onrender.com" > .env.production
   npm run build
   # Then re-upload the dist folder to Bluehost
   ```

**🎉 You're Done!** Your app is now live on the internet!

---

## 🔄 How to Update Your Website (The Magic Part)

This is where it gets cool. Here's how you make changes:

### Method 1: Through Claude (This Chat!)

1. **Tell Claude what to change:**
   ```
   "Claude, update the dashboard to show revenue in the top card"
   ```

2. **Claude makes the changes to your files**

3. **Save to GitHub (for backup):**
   ```bash
   cd "/Users/davidwright/Desktop/untitled folder/FieldLink v5"
   git add .
   git commit -m "Updated dashboard with Claude"
   git push
   ```

4. **For Backend Changes:**
   - If Claude changed backend files → **Auto-deploys to Render!** ✨
   - GitHub receives code → Render detects change → Rebuilds in 2 minutes

5. **For Frontend Changes:**
   - If Claude changed frontend files → **You need to rebuild and re-upload:**

   ```bash
   # Rebuild frontend
   cd "/Users/davidwright/Desktop/untitled folder/FieldLink v5/frontend"
   npm run build

   # Then upload the 'dist' folder to Bluehost using File Manager
   ```

### Quick Deploy Script (Makes Life Easier!)

Let me create a script that does all this for you:

```bash
# Save this as deploy.sh in your project root
#!/bin/bash

echo "🚀 Deploying FieldLink..."

# 1. Save to GitHub
git add .
git commit -m "Update: $1"
git push

# 2. Rebuild frontend
cd frontend
npm run build

echo "✅ Built! Now upload 'frontend/dist' folder to Bluehost File Manager"
echo "📁 Upload location: public_html/fieldlink"
```

**To use it:**
```bash
./deploy.sh "Changed dashboard color to blue"
```

### The Commands You'll Use:

**For any changes:**
```bash
# 1. Save to GitHub (backend auto-deploys!)
git add .
git commit -m "Describe changes"
git push

# 2. If frontend changed, rebuild:
cd frontend
npm run build
# Then upload dist/ to Bluehost
```

**Backend updates:** Automatic! (2 minutes)
**Frontend updates:** Manual rebuild + upload (5 minutes)

---

## 🧪 Testing Your Deployment

### Step 1: Open Your Website
- Go to: `https://yourdomain.com/fieldlink` (or your Bluehost URL)

### Step 2: Create an Account
- Click "Sign Up"
- Enter your email and password
- You should see the dashboard

### Step 3: Upload a Recording
- Click "Recordings" → "Upload"
- Upload a sample audio file
- Wait 1-2 minutes
- You should see transcription and analysis

**If this works, everything is deployed correctly! 🎉**

---

## 💰 Costs Breakdown (What You'll Pay)

### Free Tier (Perfect for You!):
- ✅ **Bluehost:** Already paid! (your existing hosting)
- ✅ **Render:** 750 hours/month (FREE)
- ✅ **Supabase:** 500MB database + 1GB file storage (FREE)
- ✅ **GitHub:** Unlimited private repos (FREE)
- 💳 **OpenAI:** $0.21 per recording (only pay for what you use)
- 💳 **AWS S3:** ~$0.02 per recording stored

**Total for 10 recordings/day:** ~$65/month (just OpenAI + AWS)
**Total for 100 recordings/day:** ~$650/month (just OpenAI + AWS)

### When You Grow (Paid Plans):
- Render Starter: $7/month (backend never sleeps)
- Supabase Pro: $25/month (8GB database + 100GB storage)

**You save $20-40/month by using Bluehost instead of Vercel!** 🎉

---

## 🆘 Troubleshooting

### "I can't log in"
- Check if your backend is running: Visit `https://fieldlink-backend.onrender.com/health`
- Should say: `{"status": "ok"}`

### "Upload doesn't work"
- Check your OpenAI API key is correct in Render environment variables
- Check your AWS credentials are correct

### "I made changes but website didn't update"
- Did you run `git push`?
- Check Vercel dashboard → "Deployments" → Make sure latest deployment succeeded
- Wait 2-3 minutes after pushing

### "I'm getting errors"
- Check Render logs: Render Dashboard → Your Service → "Logs"
- Check Vercel logs: Vercel Dashboard → Your Project → "Deployments" → Click latest → "Logs"

---

## 📞 Quick Reference

### Important URLs:
- **Your Website:** `https://yourdomain.com/fieldlink` (your Bluehost domain)
- **Your Backend:** `https://fieldlink-backend.onrender.com`
- **Your Code:** `https://github.com/YourUsername/fieldlink-v5`
- **Bluehost Dashboard:** `https://my.bluehost.com`
- **Render Dashboard:** `https://dashboard.render.com`
- **Supabase Dashboard:** `https://app.supabase.com`

### Commands You'll Use Daily:

```bash
# See what changed
git status

# Save and upload changes
git add .
git commit -m "Description of changes"
git push

# Pull latest changes
git pull
```

---

## 🎓 Next Steps After Deployment

1. **Custom Domain (You might already have this!):**
   - If you already have a domain with Bluehost, just use it!
   - Example: `https://yourdomain.com/fieldlink`
   - Or set up subdomain: `https://app.yourdomain.com`

2. **Set Up Monitoring:**
   - Bluehost has built-in analytics (see visitor counts)
   - Render shows backend errors and performance
   - Supabase shows database usage
   - Check these weekly

3. **Backups:**
   - Supabase backs up your database automatically (every day)
   - Bluehost backs up your files (usually weekly)
   - GitHub has all your code history
   - You're triple-protected!

4. **Automatic Frontend Deployment (Advanced - Optional):**
   - Set up GitHub Actions to auto-build and deploy to Bluehost via FTP
   - Ask Claude: "Help me set up auto-deploy to Bluehost" when you're ready!

---

## 🎉 Congratulations!

You now have a professional, live web application that:
- ✅ Anyone can access from anywhere
- ✅ Automatically updates when you push changes
- ✅ Stores data in a real database
- ✅ Uses AI to analyze conversations
- ✅ Can be updated through Claude

**You're now a web developer!** 🚀

---

*Need help? Just ask Claude: "Claude, help me deploy step X" or "Claude, I'm stuck on [problem]"*
