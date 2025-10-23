# ☁️ CLOUDINARY SETUP GUIDE - FREE IMAGE STORAGE

## Why Cloudinary?
- ✅ **25 GB free storage** (5x more than Firebase)
- ✅ **25 GB bandwidth/month**
- ✅ **No credit card required**
- ✅ **Built-in image transformations**
- ✅ **Fast CDN delivery**
- ✅ **Easy to use API**

---

## 🚀 Setup Instructions

### **Step 1: Create Cloudinary Account**

1. Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with email (no credit card needed!)
3. Verify your email
4. You'll be taken to the dashboard

### **Step 2: Get Your Credentials**

From the Cloudinary Dashboard, you'll see:

```
Cloud Name: your_cloud_name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz
```

### **Step 3: Create Upload Preset**

1. Go to **Settings** (gear icon) → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `visora_uploads`
   - **Signing Mode**: **Unsigned** (important!)
   - **Folder**: Leave empty (we'll set it dynamically from code)
   
5. In **Upload manipulations**:
   - **Disallow public ID**: Keep default (Auto-generate unguessable public ID) ✅
   - **Generated display name**: Keep default (Use filename) ✅
   
6. Click **Save**

**Note:** By default, uploads are public and accessible via CDN. No need to change access mode settings.

### **Step 4: Add to .env File**

Add these to your `.env` file:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=visora_uploads
```

**Replace `your_cloud_name` with your actual cloud name from the dashboard!**

---

## 📁 Folder Structure

Cloudinary will organize your images like this:

```
visora/
  ├── {userId}/
  │   ├── uploads/          ← Original uploaded images
  │   ├── processed/        ← AI-edited images
  │   ├── generated/        ← AI-generated images
  │   └── analysis/         ← Visual intelligence images
```

---

## 🔧 Usage Examples

### **Upload an Image**

```typescript
import { storageService } from './services/storageService';

// Upload with progress tracking
const uploadWithProgress = async (file: File) => {
  const url = await storageService.uploadImage(
    file,
    currentUser.uid,
    'uploads',
    (progress) => {
      console.log(`Upload progress: ${progress}%`);
      setUploadProgress(progress);
    }
  );
  console.log('Image URL:', url);
};

// Simple upload (no progress)
const simpleUpload = async (file: File) => {
  const url = await storageService.uploadImage(
    file,
    currentUser.uid,
    'uploads'
  );
  console.log('Image URL:', url);
};
```

### **Upload a Processed Blob**

```typescript
// After processing an image
const processedBlob = await upscaleImage(file, { scaleFactor: 2 });

const url = await storageService.uploadBlob(
  processedBlob,
  currentUser.uid,
  'processed',
  `upscaled_${file.name}`
);
```

### **Get Optimized URL**

Cloudinary has built-in transformations! Resize images on-the-fly:

```typescript
const originalUrl = 'https://res.cloudinary.com/your-cloud/image/upload/visora/user123/image.jpg';

// Get thumbnail (300px wide)
const thumbnail = storageService.getOptimizedUrl(originalUrl, {
  width: 300,
  quality: 'auto',
  format: 'auto'
});

// Get compressed version
const compressed = storageService.getOptimizedUrl(originalUrl, {
  quality: 80,
  format: 'webp'
});
```

---

## 🎨 Image Transformations

Cloudinary URL structure:
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
```

Common transformations:
- `w_300` - Width 300px
- `h_200` - Height 200px
- `q_auto` - Auto quality
- `f_auto` - Auto format (WebP for supported browsers)
- `c_fill` - Crop to fill dimensions
- `e_blur:300` - Blur effect

Example:
```
https://res.cloudinary.com/demo/image/upload/w_300,h_200,q_auto,f_auto/sample.jpg
```

---

## 💰 Free Tier Limits

| Feature | Free Tier |
|---------|-----------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Transformations | 25 credits/month |
| Images | Unlimited |
| Video storage | 0 GB (paid only) |

**Estimate for Visora:**
- 100 users × 50 images each × 2MB = ~10 GB storage ✅
- 1000 views/day × 2MB = 60 GB/month bandwidth ✅ (well within limits)

---

## 🔒 Security

### **Upload Presets (Unsigned)**
- ✅ No API secret exposed to client
- ✅ Safe for frontend use
- ✅ Can restrict upload parameters

### **Signed Uploads (Optional - For Production)**
If you need more security, implement signed uploads with your backend:

```python
# backend/app.py
import cloudinary
import cloudinary.uploader

cloudinary.config(
  cloud_name = "your_cloud_name",
  api_key = "your_api_key",
  api_secret = "your_api_secret"
)

@app.route('/api/sign-upload', methods=['POST'])
def sign_upload():
    timestamp = int(time.time())
    signature = cloudinary.utils.api_sign_request(
        {"timestamp": timestamp},
        "your_api_secret"
    )
    return {
        "signature": signature,
        "timestamp": timestamp
    }
```

---

## 🆚 Comparison: Cloudinary vs Firebase Storage

| Feature | Cloudinary Free | Firebase Free |
|---------|----------------|---------------|
| Storage | **25 GB** | 5 GB |
| Bandwidth | **25 GB/month** | 1 GB/day |
| Transformations | ✅ Built-in | ❌ Need to implement |
| CDN | ✅ Global | ✅ Global |
| Setup | Easy | **Need upgrade** |
| Credit Card | ❌ Not required | ✅ Required for storage |

**Winner: Cloudinary** 🏆

---

## 📝 Environment Variables

Your `.env` file should have:

```env
# Firebase (for Auth & Database only)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Cloudinary (for Image Storage)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=visora_uploads

# Other APIs
VITE_REMOVEBG_API_KEY=your_removebg_key
VITE_GEMINI_API_KEY=your_gemini_key
```

---

## 🎯 Integration Checklist

- ✅ storageService.ts updated to use Cloudinary
- ✅ firestoreService.ts ready for metadata (URLs stored in Firestore)
- ✅ useHistory.ts hook ready for integration
- [ ] Create Cloudinary account
- [ ] Create upload preset
- [ ] Add credentials to .env
- [ ] Test uploads
- [ ] Integrate with AI Studio pages

---

## 📚 Resources

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Transformation Reference](https://cloudinary.com/documentation/image_transformation_reference)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)

---

**Created**: October 23, 2025  
**For**: Visora AI Image & Text Intelligence Platform  
**Status**: Ready to use! 🚀
