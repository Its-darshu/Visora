# 🚀 Deployment Checklist for Visora

## ✅ Pre-Deployment Security Check

### 1. Environment Variables
- [x] All API keys moved to `.env` files
- [x] `.gitignore` includes all `.env*` files
- [x] `.env.example` files have placeholder values only
- [x] No hardcoded API keys in source code
- [ ] All team members have their own `.env` files locally

### 2. Git Repository
```bash
# Run these commands to verify:
git status                           # Should NOT show .env files
git check-ignore .env               # Should show .env is ignored
grep -r "AIza" --exclude-dir=node_modules --exclude-dir=.git .  # Should only find in .env.example
```

### 3. Files That Must Be Ignored
- ✅ `.env`
- ✅ `.env.local`
- ✅ `.env.figma`
- ✅ `backend/.env`
- ✅ All files matching `.env*` (except `.env.example`)

## 🎯 Deployment Steps

### Option 1: Render (Recommended)

#### Frontend Deployment
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. Go to https://dashboard.render.com/
3. Click **"New +"** → **"Static Site"**
4. Select your repository: `Its-darshu/Visora`
5. Configure:
   ```
   Name: visora-frontend
   Branch: main
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

6. Add Environment Variables (click "Environment" tab):
   ```
   VITE_API_KEY
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   VITE_CLOUDINARY_CLOUD_NAME
   VITE_CLOUDINARY_API_KEY
   VITE_CLOUDINARY_API_SECRET
   VITE_CLOUDINARY_UPLOAD_PRESET
   VITE_REMOVEBG_API_KEY (optional)
   ```

#### Backend Deployment
1. Click **"New +"** → **"Web Service"**
2. Select your repository: `Its-darshu/Visora`
3. Configure:
   ```
   Name: visora-backend
   Branch: main
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python app.py
   ```

4. Add Environment Variables:
   ```
   GEMINI_API_KEY
   HUGGINGFACE_API_TOKEN
   FLASK_ENV=production
   FLASK_DEBUG=False
   PORT=5000
   ```

5. Update Frontend with Backend URL:
   - Get your backend URL from Render (e.g., `https://visora-backend.onrender.com`)
   - Add to frontend environment variables:
     ```
     VITE_BACKEND_URL=https://visora-backend.onrender.com
     ```

### Option 2: Vercel (Frontend Only)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard

### Option 3: Netlify (Frontend Only)

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

## 🔐 Post-Deployment Security

### 1. Verify API Keys Are Secure
- [ ] Check deployed site source code (browser DevTools)
- [ ] Ensure no API keys visible in JavaScript files
- [ ] Test that environment variables are working

### 2. Configure Firebase Security
- [ ] Update Firebase Firestore rules
- [ ] Set up authorized domains in Firebase Console
- [ ] Enable App Check (optional but recommended)

### 3. Configure CORS
- [ ] Update backend CORS settings with frontend URL
- [ ] Test API calls from frontend to backend

### 4. Monitor Usage
- [ ] Set up Firebase usage alerts
- [ ] Monitor Gemini API quota
- [ ] Check Cloudinary bandwidth usage

## 🧪 Testing Checklist

After deployment:
- [ ] User authentication works
- [ ] Image upload and analysis works
- [ ] Text intelligence chatbot works
- [ ] Image generation works
- [ ] History features work
- [ ] All pages load correctly
- [ ] No console errors

## 📊 Performance Optimization

- [ ] Images are optimized (use Cloudinary transformations)
- [ ] Enable caching on Render/Vercel
- [ ] Minimize bundle size
- [ ] Use lazy loading for components

## 🆘 Troubleshooting

### "Environment variable not defined"
- Double-check spelling in Render dashboard
- Redeploy after adding new variables
- Check build logs for errors

### CORS Errors
- Add frontend URL to backend CORS configuration
- Update Firebase authorized domains

### API Rate Limits
- Monitor usage in respective dashboards
- Implement rate limiting on backend
- Add caching for repeated requests

## 📝 Important URLs to Save

After deployment, save these:
- Frontend URL: `https://your-app.onrender.com`
- Backend URL: `https://your-backend.onrender.com`
- Firebase Console: `https://console.firebase.google.com/`
- Cloudinary Dashboard: `https://console.cloudinary.com/`

## 🎉 You're Ready!

Once all checkboxes are complete, your app is ready for production! 🚀
