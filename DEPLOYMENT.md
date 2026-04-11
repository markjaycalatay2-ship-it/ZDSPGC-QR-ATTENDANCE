# Deployment Guide for ZDSPGC Attendance System

## Step 1: Prepare Your Files for GitHub

### Files to Include in Repository:
✅ **Required Files (DO commit these):**
```
app/                    - All Next.js pages
components/             - React components
contexts/               - Auth context
lib/                    - Firebase config
scripts/                - Admin setup scripts
public/                 - Static assets (if any)
.env.local.example      - Environment template (NO real values!)
.gitignore              - Git ignore rules
next.config.ts          - Next.js config
package.json            - Dependencies
package-lock.json       - Lock file
postcss.config.mjs      - PostCSS config
tailwind.config.ts      - Tailwind config
tsconfig.json           - TypeScript config
netlify.toml            - Netlify config
README.md               - Documentation
DEPLOYMENT.md           - This guide
```

❌ **DO NOT Commit (already in .gitignore):**
```
node_modules/           - Dependencies (install later)
.env.local              - Your real Firebase secrets
.next/                  - Build output
.vscode/                - IDE settings
```

---

## Step 2: Create GitHub Repository

### Option A: Use VS Code
1. Open VS Code command palette (Ctrl+Shift+P)
2. Type "Git: Initialize Repository"
3. Stage all files (click + on changes)
4. Write commit message: "Initial commit"
5. Click commit
6. Publish to GitHub (follow prompts)

### Option B: Use Command Line
```bash
# Navigate to project folder
cd "QR CODE"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ZDSPGC Attendance System"

# Create GitHub repo first at github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 3: Prepare Environment Variables

### Create .env.local.example:
```env
# Firebase Configuration - Add your values in .env.local (not committed)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Local Development:
1. Create `.env.local` file (already created)
2. Copy your real Firebase values from Firebase Console

### For Deployment:
You'll add these in Netlify dashboard (keep them secret!)

---

## Step 4: Deploy to Netlify

### Method A: Git-based Deployment (RECOMMENDED)

1. **Go to Netlify**: https://app.netlify.com
2. **Sign up/Login** with GitHub
3. **Click "Add new site" → "Import an existing project"**
4. **Select GitHub** and authorize
5. **Choose your repository**
6. **Build Settings** (usually auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`
7. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all from your `.env.local` file
8. **Deploy!**

### Method B: Manual Deploy (Faster)

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Go to Netlify**: https://app.netlify.com
3. **Drag and drop** your `.next` folder to deploy

---

## Step 5: Post-Deployment Setup

### 1. Get Your Site URL
- Netlify will give you a URL like: `https://zdspgc-attendance-123.netlify.app`

### 2. Update Firebase Auth Settings
1. Go to Firebase Console → Authentication → Settings
2. Add your Netlify domain to "Authorized domains"

### 3. Create Admin User
1. Register a user on your deployed site
2. Go to Firebase Console → Firestore Database
3. Find the user in `users` collection
4. Change `role` field from `"student"` to `"admin"`
5. Refresh the site - you now have admin access!

---

## Troubleshooting

### Build Fails?
- Check if `package.json` has all dependencies
- Make sure `next.config.ts` exists
- Try: `rm -rf .next && npm run build`

### Firebase Errors?
- Verify environment variables are set in Netlify
- Check Firebase Console for authorized domains
- Ensure Firestore rules allow read/write

### QR Scanner Not Working?
- QR scanning requires HTTPS (Netlify provides this)
- Camera permissions must be granted
- Works on mobile browsers (Chrome, Safari)

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start local server (localhost:3000)

# Build
npm run build            # Create production build

# Git
git add .                # Stage changes
git commit -m "message"  # Commit
git push                 # Push to GitHub
```

---

## Next Steps After Deployment

1. **Test all features**:
   - Admin login and dashboard
   - Staff QR code display
   - Student QR scanning
   - Attendance recording

2. **Set up staff accounts**:
   - Register staff users
   - Manually change their role to "staff" in Firestore

3. **Create events**:
   - Use admin or staff portal
   - Set dates and locations

4. **Test QR flow**:
   - Open staff dashboard on laptop
   - Open student scan on phone
   - Scan QR and verify attendance records

---

## Support

For issues:
1. Check browser console for errors
2. Check Netlify deploy logs
3. Check Firebase Console for data
4. Open GitHub issue with error details

**Good luck with your deployment! 🚀**
