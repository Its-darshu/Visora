# 🚀 Render Deployment Guide

## Quick Links
- **Render Dashboard**: https://dashboard.render.com/
- **Your GitHub Repo**: https://github.com/Its-darshu/Visora

---

## 📦 Step 1: Deploy Backend (Python Flask)

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub and select **`Its-darshu/Visora`**
4. Configure:

```
Name: visora-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: python app.py
Instance Type: Free
```

5. **Environment Variables** (click "Advanced"):

```
GEMINI_API_KEY = [Get from your .env file]
FLASK_ENV = production
FLASK_DEBUG = False
PORT = 5000
```

6. Click **"Create Web Service"**
7. Wait 3-5 minutes for deployment
8. **SAVE YOUR BACKEND URL**: `https://visora-backend-xxxx.onrender.com`

---

## 🌐 Step 2: Deploy Frontend (React + Vite)

1. Click **"New +"** → **"Static Site"**
2. Select **`Its-darshu/Visora`**
3. Configure:

```
Name: visora-frontend
Branch: main
Build Command: npm install && npm run build
Publish Directory: dist
```

4. **Environment Variables** (Get from your `.env` file):

```
VITE_API_KEY = [Gemini API Key]
VITE_FIREBASE_API_KEY = [Firebase API Key]
VITE_FIREBASE_AUTH_DOMAIN = [your-project.firebaseapp.com]
VITE_FIREBASE_PROJECT_ID = [your-project-id]
VITE_FIREBASE_STORAGE_BUCKET = [your-project.firebasestorage.app]
VITE_FIREBASE_MESSAGING_SENDER_ID = [your-sender-id]
VITE_FIREBASE_APP_ID = [your-app-id]
VITE_CLOUDINARY_CLOUD_NAME = [cloudinary-name]
VITE_CLOUDINARY_API_KEY = [cloudinary-key]
VITE_CLOUDINARY_API_SECRET = [cloudinary-secret]
VITE_CLOUDINARY_UPLOAD_PRESET = [your-preset]
VITE_BACKEND_URL = [Backend URL from Step 1]
```

5. Click **"Create Static Site"**
6. Wait 3-5 minutes for deployment
7. **SAVE YOUR FRONTEND URL**: `https://visora-frontend-xxxx.onrender.com`

---

## 🔧 Step 3: Update Backend CORS

1. Go back to your **Backend Service** in Render
2. Click **"Environment"** → **"Add Environment Variable"**
3. Add:
   ```
   FRONTEND_URL = [Frontend URL from Step 2]
   ```
4. Click **"Save Changes"**
5. Backend will automatically redeploy

---

## 🔥 Step 4: Configure Firebase

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your frontend domains:
   - `visora-frontend-xxxx.onrender.com`
   - Click **"Add domain"**

---

## ✅ Step 5: Test Your App

1. Open your frontend URL: `https://visora-frontend-xxxx.onrender.com`
2. Test these features:
   - [ ] Landing page loads
   - [ ] Sign up / Login works
   - [ ] Visual AI (image upload & analysis)
   - [ ] Generate Image
   - [ ] Text Intelligence (chat)
   - [ ] Image enhancement/editing

---

## 🐛 Troubleshooting

### Backend not starting?
- Check **Logs** tab in Render dashboard
- Verify all environment variables are set
- Make sure `requirements.txt` is correct

### Frontend not loading?
- Check **Events** tab for build errors
- Verify all `VITE_*` environment variables
- Check browser console for errors

### CORS errors?
- Make sure `FRONTEND_URL` is set in backend
- Verify Firebase authorized domains
- Check backend logs

### API calls failing?
- Verify `VITE_BACKEND_URL` in frontend
- Check if backend is online
- Verify API keys are correct

---

## 📊 Free Tier Limits

**Render Free Tier:**
- Backend: 750 hours/month
- Backend sleeps after 15 min of inactivity (wakes on request)
- 100 GB bandwidth/month
- Static sites: Always on, unlimited bandwidth

**Tips:**
- Backend will be slow on first request (cold start ~30s)
- Keep backend awake with a ping service (optional)
- Monitor usage in Render dashboard

---

## 🎉 You're Live!

Your app is now deployed! Share your URL:
`https://visora-frontend-xxxx.onrender.com`

**Next Steps:**
- Set up custom domain (optional)
- Monitor usage and errors
- Add analytics
- Optimize performance
