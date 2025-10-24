# 🔐 Environment Variables for Render Deployment

## ⚠️ IMPORTANT: Use Your Own API Keys

**DO NOT use the example values below - replace with your actual keys from `.env` file**

---

## 📦 BACKEND Environment Variables
**Service: visora-backend (Web Service)**

Copy format and replace with your actual values:

```
GEMINI_API_KEY=[Copy from backend/.env]
HUGGINGFACE_API_TOKEN=[Copy from backend/.env]
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
```

**After deploying frontend, add:**
```
FRONTEND_URL=https://your-frontend-url.onrender.com
```

---

## 🌐 FRONTEND Environment Variables
**Service: visora-frontend (Static Site)**

Copy format and replace with your actual values from `.env.local`:

```
VITE_API_KEY=[Copy from .env.local]
VITE_FIREBASE_API_KEY=[Copy from .env.local]
VITE_FIREBASE_AUTH_DOMAIN=[Copy from .env.local]
VITE_FIREBASE_PROJECT_ID=[Copy from .env.local]
VITE_FIREBASE_STORAGE_BUCKET=[Copy from .env.local]
VITE_FIREBASE_MESSAGING_SENDER_ID=[Copy from .env.local]
VITE_FIREBASE_APP_ID=[Copy from .env.local]
```

**After deploying backend, add:**
```
VITE_BACKEND_URL=https://your-backend-url.onrender.com
```

---

## 📋 How to Add in Render:

### Get Your Values:
1. Open your **`.env.local`** file for frontend variables
2. Open your **`backend/.env`** file for backend variables
3. Copy the actual values from these files

### For Each Variable:
1. Click **"Advanced"** or **"Environment"** tab in Render
2. Click **"Add Environment Variable"**
3. **Key**: Variable name (e.g., `VITE_API_KEY`)
4. **Value**: Your actual value from `.env` file
5. Click **"Add"**
6. Repeat for all variables

### Example Format:

**Backend:**
```
Key: GEMINI_API_KEY
Value: [Paste your actual Gemini API key]

Key: HUGGINGFACE_API_TOKEN
Value: [Paste your actual Hugging Face token]

Key: FLASK_ENV
Value: production

Key: FLASK_DEBUG
Value: False

Key: PORT
Value: 5000
```

**Frontend:**
```
Key: VITE_API_KEY
Value: [Paste your actual Gemini API key]

Key: VITE_FIREBASE_API_KEY
Value: [Paste your actual Firebase API key]

Key: VITE_FIREBASE_AUTH_DOMAIN
Value: [Paste your actual Firebase auth domain]

Key: VITE_FIREBASE_PROJECT_ID
Value: [Paste your actual Firebase project ID]

Key: VITE_FIREBASE_STORAGE_BUCKET
Value: [Paste your actual Firebase storage bucket]

Key: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: [Paste your actual Firebase sender ID]

Key: VITE_FIREBASE_APP_ID
Value: [Paste your actual Firebase app ID]
```

---

## 🔗 Deployment Order:

1. **Deploy Backend First** → Get backend URL
2. **Add VITE_BACKEND_URL** to frontend environment variables
3. **Deploy Frontend** → Get frontend URL
4. **Add FRONTEND_URL** to backend environment variables
5. **Backend will auto-redeploy** with CORS update

---

## ✅ Verification:

After deployment, check:
- [ ] Backend is running (open backend URL in browser)
- [ ] Frontend loads without errors
- [ ] Login/signup works (Firebase connection)
- [ ] Image analysis works (Backend + Gemini API)
- [ ] Chat works (Gemini API)

---

## 🆘 If Something Doesn't Work:

1. Check **Logs** tab in Render for errors
2. Verify all environment variables are spelled correctly
3. Make sure there are no trailing spaces in values
4. Check Firebase Console → Authentication → Authorized Domains
5. Add your Render domain to Firebase authorized domains

---

**Ready to deploy? Copy these values and head to https://dashboard.render.com/** 🚀
