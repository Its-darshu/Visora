# 🚀 Quick Start - Image-to-Text Feature

## ⚡ 3-Step Setup

### Step 1: Get Gemini API Key (2 minutes)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Step 2: Configure Backend (1 minute)
Edit `E:\Visora\backend\.env`:
```bash
GEMINI_API_KEY=paste_your_key_here
```

### Step 3: Start Services (30 seconds)
```powershell
# Terminal 1 - Backend
cd E:\Visora\backend
python app.py

# Terminal 2 - Frontend  
cd E:\Visora
npm run dev
```

## ✅ Test It!
1. Open http://localhost:5173
2. Login to your account
3. Click **"Visual AI 👁️"** in navigation
4. Upload an image
5. Click **"Analyze"**
6. See extracted text + AI insights!

## 🎯 What You Can Do

### Extract Text from Images
- Screenshots with text
- Documents (photos of papers)
- Signs and billboards
- Handwriting (limited)
- Memes with text

### Analyze Images
- Describe what's in the photo
- Identify objects and people
- Explain image context
- Answer questions about the image

### Custom Prompts (Optional)
Try these:
- "Extract all text exactly as shown"
- "Describe this image in detail"
- "What objects are visible?"
- "Identify the person in this photo"
- "What's happening in this scene?"

## 📋 Files Changed

```
E:\Visora\
├── services/
│   └── imageAnalysisService.ts ← NEW
├── pages/
│   └── VisualIntelligencePage.tsx ← UPDATED  
├── backend/
│   ├── app.py ← UPDATED (added /api/upload, /api/analyze)
│   ├── requirements.txt ← UPDATED
│   └── .env ← ADD YOUR GEMINI_API_KEY HERE
└── IMAGE_TO_TEXT_SETUP.md ← Full documentation
```

## 🐛 Quick Troubleshooting

**Error: "GEMINI_API_KEY not configured"**
→ Add your API key to `backend/.env`

**Error: "Failed to upload image"**
→ Make sure backend is running on port 5000

**No text extracted**
→ Normal! If image has no text, you'll get AI description instead

**Preview not showing**
→ Check file is actually an image (JPG, PNG, etc.)

## 📱 Supported Formats
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ✅ BMP
- ✅ WEBP
- ⚠️ Max 16MB

## 🎨 UI Features
- Drag & drop upload
- Image preview
- Custom prompts
- Copy buttons
- Loading states
- Error messages
- Clear functionality

## 📚 Full Documentation
See `IMAGE_TO_TEXT_SETUP.md` for complete guide.

## ✨ That's It!
Your Image-to-Text feature is ready to use! 🎉
