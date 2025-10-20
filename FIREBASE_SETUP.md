# 🔥 Firebase Setup Guide for Visora

## Quick Fix for "auth/invalid-api-key" Error

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Sign in with your Google account

### Step 2: Create or Select Project
1. Click "Add project" or select "visora-65" if it exists
2. If creating new:
   - Enter project name: `Visora`
   - Accept terms
   - Disable Google Analytics (optional)
   - Click "Create project"

### Step 3: Register Web App
1. In your project, click the `</>` (Web) icon
2. Register app:
   - App nickname: `Visora Web App`
   - ✅ Check "Also set up Firebase Hosting"
   - Click "Register app"

3. **Copy the configuration** (looks like this):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 4: Enable Authentication
1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Google**:
   - Click on "Google"
   - Toggle "Enable"
   - Select support email
   - Click "Save"

### Step 5: Add Authorized Domains
1. Still in Authentication → Settings → Authorized domains
2. Make sure these are added:
   - `localhost` (should be there by default)
   - Your production domain (when deployed)

### Step 6: Update .env.local
1. Open `e:\Visora\.env.local`
2. Replace the Firebase values with your NEW configuration:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 7: Restart Development Server
```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## Common Issues & Solutions

### Issue 1: "auth/invalid-api-key"
**Cause**: Wrong API key or project not properly configured

**Solution**:
1. Verify you copied the correct API key from Firebase Console
2. Make sure you're using the Web API key, not Android/iOS keys
3. Check that the project exists and is active

### Issue 2: "auth/unauthorized-domain"
**Cause**: Current domain not authorized

**Solution**:
1. Go to Authentication → Settings → Authorized domains
2. Add `localhost` and your domain
3. Wait a few minutes for changes to propagate

### Issue 3: "auth/operation-not-allowed"
**Cause**: Google sign-in not enabled

**Solution**:
1. Go to Authentication → Sign-in method
2. Enable Google provider
3. Add support email

---

## Verification Checklist

Before running the app, verify:

- [ ] Firebase project created and active
- [ ] Web app registered in project
- [ ] Authentication enabled
- [ ] Google sign-in provider enabled
- [ ] Support email added to Google provider
- [ ] `localhost` in authorized domains
- [ ] All 6 Firebase config values copied to `.env.local`
- [ ] `.env.local` is in the root directory (not in src/)
- [ ] Development server restarted after changes

---

## Testing Authentication

1. Start the app: `npm run dev`
2. Open browser: `http://localhost:5175/`
3. You should be redirected to `/auth`
4. Click "Sign in with Google"
5. Select your Google account
6. You should be redirected to Dashboard

If you see the Dashboard, authentication is working! ✅

---

## Production Deployment Notes

When deploying to production:

1. **Update Authorized Domains**:
   - Add your production domain
   - Example: `visora-app.vercel.app`

2. **Environment Variables**:
   - Set all `VITE_FIREBASE_*` variables in your hosting platform
   - Never commit `.env.local` to Git

3. **API Key Restrictions** (Optional but recommended):
   - Go to Google Cloud Console
   - Find your Firebase API key
   - Add HTTP referrer restrictions
   - Add your domains

---

## Alternative: Demo Mode (Without Firebase)

If you want to test without setting up Firebase:

1. Create a mock authentication context
2. Comment out Firebase calls
3. Use localStorage for session

**Not recommended for production!**

---

## Need Help?

1. **Firebase Documentation**: https://firebase.google.com/docs/web/setup
2. **Firebase Console**: https://console.firebase.google.com/
3. **Check Firebase Status**: https://status.firebase.google.com/

---

## Quick Commands

```bash
# Install Firebase CLI (optional)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy to Firebase Hosting
firebase deploy
```

---

**After following these steps, your authentication should work perfectly!** 🎉
