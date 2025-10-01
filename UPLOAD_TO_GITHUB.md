# Upload to GitHub - Step by Step

## Commands to Run (Copy and paste these ONE AT A TIME)

Open your Terminal and run these commands in order:

### 1. Go to your project folder
```bash
cd "/Users/davidwright/Desktop/untitled folder/FieldLink v5"
```

### 2. Stage all your files
```bash
git add .
```

### 3. Create your first commit
```bash
git commit -m "Initial commit: FieldLink v5 ready for deployment"
```

### 4. Connect to your GitHub repository
```bash
git remote add origin https://github.com/davidwright12092-create/fieldlink-v5.git
```

### 5. Rename branch to main
```bash
git branch -M main
```

### 6. Upload to GitHub
```bash
git push -u origin main
```

**Note:** When you run step 6, GitHub might ask for your username and password. If it does:
- Username: `davidwright12092-create`
- Password: Use a **Personal Access Token** (not your regular GitHub password)

If you need a token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "FieldLink"
4. Check "repo" permissions
5. Click "Generate token"
6. Copy the token and use it as your password

---

After all commands succeed, your code will be on GitHub! ✅
