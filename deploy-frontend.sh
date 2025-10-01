#!/bin/bash

echo "🚀 Deploying FieldLink Frontend..."

# Navigate to frontend directory
cd "/Users/davidwright/Desktop/untitled folder/FieldLink v5/frontend"

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Create ZIP file
echo "📦 Creating deployment package..."
cd dist
zip -r ~/Desktop/fieldlink-frontend-deploy.zip .

echo "✅ Done! Upload ~/Desktop/fieldlink-frontend-deploy.zip to Bluehost"
echo "📁 Upload location: public_html/website_994f9938/"
echo ""
echo "Steps:"
echo "1. Go to Bluehost File Manager"
echo "2. Navigate to public_html/website_994f9938/"
echo "3. Delete old files (index.html and assets folder)"
echo "4. Upload fieldlink-frontend-deploy.zip"
echo "5. Extract it"
echo "6. Move files from 'dist' folder to root"
echo "7. Delete the zip and empty dist folder"
