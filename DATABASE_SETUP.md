# 🗄️ DATABASE SETUP GUIDE - VISORA

## 📊 Database Choice: Firebase Firestore + Cloudinary

### Why This Combo?
✅ **Firestore Database** - NoSQL for structured data (user profiles, history, metadata)  
✅ **Cloudinary Storage** - 25GB free image storage (5x more than Firebase!)  
✅ **Already Integrated** - Using Firebase Auth  
✅ **Real-time Sync** - Perfect for chat history  
✅ **Built-in CDN** - Fast image delivery worldwide  
✅ **Free Tier** - No credit card required for Cloudinary  
✅ **No Backend Required** - Direct client-side access with security rules

**Note:** We use **Cloudinary for images** and **Firestore for metadata** because Firebase Storage requires billing upgrade.

---

## 🏗️ Database Structure

### **Firestore Collections**

```
users/
  {userId}/
    - email: string
    - displayName: string
    - photoURL: string
    - createdAt: timestamp
    - subscription: 'free' | 'pro'
    - apiUsage: {
        imagesGenerated: number
        imagesProcessed: number
        chatMessages: number
      }

imageHistory/
  {historyId}/
    - userId: string (indexed)
    - type: 'upscale' | 'background-remove' | 'enhance' | 'filter' | 'crop' | 'transform'
    - originalImageUrl: string (Firebase Storage URL)
    - processedImageUrl: string (Firebase Storage URL)
    - settings: object
    - createdAt: timestamp
    - fileSize: number
    - dimensions: { width: number, height: number }

generatedImages/
  {imageId}/
    - userId: string (indexed)
    - prompt: string
    - imageUrl: string
    - style: string
    - quality: string
    - createdAt: timestamp

chatHistory/
  {sessionId}/
    - userId: string (indexed)
    - messages: array<{
        role: 'user' | 'assistant'
        content: string
        imageUrl?: string
        timestamp: timestamp
      }>
    - createdAt: timestamp
    - lastMessageAt: timestamp

visualAnalysis/
  {analysisId}/
    - userId: string (indexed)
    - imageUrl: string
    - extractedText: string
    - aiAnalysis: string
    - createdAt: timestamp
```

### **Firebase Storage Structure**

```
gs://your-bucket/
  users/{userId}/
    uploads/          ← Original uploaded images
      original_{timestamp}.jpg
    processed/        ← AI-edited images
      upscaled_{timestamp}.jpg
      enhanced_{timestamp}.jpg
      bg-removed_{timestamp}.png
    generated/        ← AI-generated images
      ai-gen_{timestamp}.jpg
    analysis/         ← Visual intelligence images
      analyzed_{timestamp}.jpg
```

---

## 🚀 Setup Instructions

### **Step 1: Enable Firestore Database**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **"Firestore Database"** in left sidebar
4. Click **"Create database"**
5. Choose **"Start in production mode"** (we'll add rules later)
6. Select location (choose closest to users - e.g., `us-central1`)
7. Click **"Enable"**

### **Step 2: Enable Firebase Storage**

1. In Firebase Console, click **"Storage"** in left sidebar
2. Click **"Get started"**
3. Keep default security rules for now
4. Use same location as Firestore
5. Click **"Done"**

### **Step 3: Create Firestore Indexes**

Go to Firestore → Indexes → Create Index:

**Index 1: Image History by User**
```
Collection: imageHistory
Fields:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

**Index 2: Image History by Type**
```
Collection: imageHistory
Fields:
  - userId (Ascending)
  - type (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

**Index 3: Chat History**
```
Collection: chatHistory
Fields:
  - userId (Ascending)
  - lastMessageAt (Descending)
Query scope: Collection
```

**Index 4: Generated Images**
```
Collection: generatedImages
Fields:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

**Index 5: Visual Analysis**
```
Collection: visualAnalysis
Fields:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

---

## 🔒 Security Rules

### **Firestore Rules** (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }
    
    // Image history
    match /imageHistory/{historyId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Generated images
    match /generatedImages/{imageId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Chat history
    match /chatHistory/{sessionId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow write: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
    
    // Visual analysis
    match /visualAnalysis/{analysisId} {
      allow read: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow delete: if isAuthenticated() && isOwner(resource.data.userId);
    }
  }
}
```

### **Storage Rules** (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**To apply rules:**
1. Go to Firestore → Rules tab
2. Copy-paste Firestore rules
3. Click **"Publish"**
4. Go to Storage → Rules tab
5. Copy-paste Storage rules
6. Click **"Publish"**

---

## 📦 Usage Examples

### **Save Image History**

```typescript
import { firestoreService } from './services/firestoreService';
import { storageService } from './services/storageService';

// After processing an image
const handleImageUpscale = async (file: File, scaleFactor: number) => {
  const userId = currentUser.uid;
  
  // 1. Upload original image
  const originalUrl = await storageService.uploadImage(file, userId, 'uploads');
  
  // 2. Process image (your existing logic)
  const processedBlob = await upscaleImage(file, { scaleFactor, enhanceQuality: true });
  
  // 3. Upload processed image
  const processedUrl = await storageService.uploadBlob(
    processedBlob,
    userId,
    'processed',
    `upscaled_${scaleFactor}x_${file.name}`
  );
  
  // 4. Get image dimensions
  const dimensions = await storageService.getImageDimensions(file);
  
  // 5. Save to Firestore
  await firestoreService.saveImageHistory({
    userId,
    type: 'upscale',
    originalImageUrl: originalUrl,
    processedImageUrl: processedUrl,
    settings: { scaleFactor, enhanceQuality: true },
    fileSize: file.size,
    dimensions
  });
  
  // 6. Update user API usage
  await firestoreService.updateUserApiUsage(userId, 'imagesProcessed');
};
```

### **Save Chat Message**

```typescript
// When user sends a message
const handleSendMessage = async (text: string, imageFile?: File) => {
  const userId = currentUser.uid;
  let imageUrl: string | undefined;
  
  // Upload image if present
  if (imageFile) {
    imageUrl = await storageService.uploadImage(imageFile, userId, 'analysis');
  }
  
  // Update chat session
  const newMessage = {
    role: 'user' as const,
    content: text,
    imageUrl,
    timestamp: Timestamp.now()
  };
  
  await firestoreService.updateChatSession(currentSessionId, [
    ...messages,
    newMessage
  ]);
  
  // Update API usage
  await firestoreService.updateUserApiUsage(userId, 'chatMessages');
};
```

### **Load History**

```typescript
// Load user's image history
const loadHistory = async () => {
  const userId = currentUser.uid;
  const history = await firestoreService.getImageHistory(userId, 50);
  setImageHistory(history);
};

// Load specific type
const loadUpscaleHistory = async () => {
  const history = await firestoreService.getImageHistoryByType(
    currentUser.uid,
    'upscale',
    20
  );
  setUpscaleHistory(history);
};
```

---

## 💰 Cost Estimation (Free Tier)

### **Firestore Free Tier**
- ✅ 1 GB storage
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 20,000 deletes/day

### **Storage Free Tier**
- ✅ 5 GB storage
- ✅ 1 GB/day downloads
- ✅ 20,000 uploads/day

### **Estimated Usage (Per User/Month)**
- **Image Processing**: ~100 operations = 200 writes (save + read)
- **Chat Messages**: ~500 messages = 1,000 writes
- **Image Storage**: ~50 images × 2MB = 100 MB
- **Total**: ~1,200 operations/month/user ✅ Well within limits

---

## 🎯 Next Steps

1. ✅ **Firebase services created** (`firestoreService.ts`, `storageService.ts`)
2. 📝 **Setup Firestore Database** (follow Step 1 above)
3. 📝 **Setup Firebase Storage** (follow Step 2 above)
4. 📝 **Create Firestore Indexes** (follow Step 3 above)
5. 📝 **Apply Security Rules** (copy-paste from above)
6. 🔧 **Integrate into pages** (add save/load history functionality)

---

## 🆚 Alternative Databases (Not Recommended)

| Database | Pros | Cons |
|----------|------|------|
| **Supabase** | PostgreSQL, Real-time | Need separate storage service |
| **MongoDB Atlas** | Flexible schema | Complex setup, separate storage |
| **AWS S3 + DynamoDB** | Powerful | Expensive, complex, backend required |
| **Cloudflare R2** | Cheap storage | No database, complex integration |

**Verdict**: Firebase is the best choice for Visora! 🎉

---

## 📚 Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firestore Pricing](https://firebase.google.com/pricing)

---

**Created**: October 23, 2025  
**For**: Visora AI Image & Text Intelligence Platform
