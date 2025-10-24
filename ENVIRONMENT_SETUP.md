# 🔐 Environment Variables Setup

This guide explains how to set up environment variables for local development and production deployment.

## ⚠️ SECURITY WARNING

**NEVER commit `.env` files to git!** All API keys and secrets must be kept secure.

## 📋 Required Services

Before you begin, sign up for these services and get your API keys:

1. **Google Gemini AI** - https://aistudio.google.com/app/apikey
2. **Firebase** - https://console.firebase.google.com/
3. **Cloudinary** - https://console.cloudinary.com/ (for image storage)
4. **Remove.bg** (Optional) - https://www.remove.bg/api

## 🛠️ Local Development Setup

### Step 1: Create Environment Files

```bash
# Frontend (root directory)
cp .env.example .env

# Backend (backend directory)
cp backend/.env.example backend/.env
```

### Step 2: Fill in Your API Keys

Open `.env` and `backend/.env` files and replace the placeholder values with your actual API keys.

#### Frontend `.env`:
```env
VITE_API_KEY=your_actual_gemini_api_key
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
# ... etc
```

#### Backend `backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
HUGGINGFACE_API_TOKEN=your_actual_token
```

### Step 3: Verify Setup

```bash
# Frontend
npm run dev

# Backend (in another terminal)
cd backend
python app.py
```

## 🚀 Production Deployment (Render)

### Frontend (Static Site)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Add Environment Variables in Render Dashboard:
   ```
   VITE_API_KEY=your_production_gemini_api_key
   VITE_FIREBASE_API_KEY=your_production_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
   VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   VITE_REMOVEBG_API_KEY=your_removebg_api_key (optional)
   ```

### Backend (Web Service)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

4. Add Environment Variables:
   ```
   GEMINI_API_KEY=your_production_gemini_api_key
   HUGGINGFACE_API_TOKEN=your_production_token
   FLASK_ENV=production
   FLASK_DEBUG=False
   ```

## 🔍 Verification Checklist

Before deploying, verify:

- [ ] All `.env` files are in `.gitignore`
- [ ] No API keys are hardcoded in source files
- [ ] `.env.example` files have placeholder values only
- [ ] Git status shows no `.env` files: `git status`
- [ ] All services are properly configured
- [ ] Firebase rules are set up for security

## 🆘 Troubleshooting

### "Environment variable not found" error
- Check variable name spelling (must match exactly)
- Restart dev server after adding new variables
- For Vite, variables must start with `VITE_`

### API Key errors in production
- Double-check all environment variables in Render dashboard
- Ensure no trailing spaces in values
- Redeploy after changing environment variables

## 📚 More Information

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Render Documentation](https://render.com/docs)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
