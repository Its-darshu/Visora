# 🚀 Visora - Quick Start Guide

## Get Started in 5 Minutes!

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ Google account for authentication
- ✅ Gemini API key (free tier available)

### Step 1: Clone & Install (2 minutes)
```bash
# Clone the repository
git clone https://github.com/Its-darshu/Visora.git
cd Visora

# Install dependencies
npm install
```

### Step 2: Configure Environment (2 minutes)
```bash
# Copy environment template
cp .env.example .env.local
```

#### Get Your API Keys:

1. **Gemini AI** (Required)
   - Visit: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy and paste into `.env.local` as `VITE_API_KEY`

2. **Firebase** (Required for auth)
   - Visit: https://console.firebase.google.com/
   - Create new project or use existing
   - Go to Project Settings > General
   - Scroll to "Your apps" > Add web app
   - Copy configuration values to `.env.local`

3. **Hugging Face** (Optional - for advanced image generation)
   - Visit: https://huggingface.co/settings/tokens
   - Create new token
   - Add to `backend/.env` as `HUGGINGFACE_API_TOKEN`

### Step 3: Launch (1 minute)
```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:5173
```

That's it! 🎉

---

## First Time Usage

### 1. Sign In
- Click "Sign in with Google"
- Authorize Visora to use your Google account
- You'll be redirected to the Dashboard

### 2. Try Image Intelligence
- Click "Image AI" card on dashboard
- Upload any image (photos, diagrams, screenshots)
- Click "Analyze Image"
- See instant AI insights!

### 3. Try Text Intelligence
- Click "Text AI" card on dashboard
- Paste any text
- Choose a feature (Summarize, Sentiment, etc.)
- Click "Process Text"
- View AI analysis!

### 4. Try Voice Intelligence
- Go to Dashboard
- Enter any topic in the input field
- Check all three options (Text, Image, Voice)
- Click "Generate Lesson"
- Play the audio narration!

---

## 🎯 Demo Scenarios

### Scenario 1: Analyze a Photo
**Try this:**
1. Go to Image Intelligence
2. Upload a landscape photo
3. See AI identify objects, colors, mood, and suggestions

**What you'll see:**
- Comprehensive summary
- Detected objects
- Dominant colors
- Scene description
- Relevant tags
- Usage suggestions

### Scenario 2: Summarize Long Text
**Try this:**
1. Go to Text Intelligence
2. Paste a long article or document
3. Click "Summarize"
4. Get key points in seconds

**What you'll see:**
- Concise summary
- Key points extracted
- Word count reduction
- Reading time saved

### Scenario 3: Analyze Sentiment
**Try this:**
1. Go to Text Intelligence
2. Paste customer reviews or feedback
3. Select "Sentiment" feature
4. Click "Process Text"

**What you'll see:**
- Overall sentiment (Positive/Negative/Neutral)
- Sentiment score
- Detected emotions
- Confidence levels

---

## 🐛 Troubleshooting

### Issue: "API Key not found"
**Solution:** Make sure `.env.local` file exists and contains `VITE_API_KEY`

### Issue: Authentication fails
**Solution:** 
1. Check Firebase configuration in `.env.local`
2. Enable Google Sign-In in Firebase Console
3. Add authorized domain: `localhost`

### Issue: Image generation not working
**Solution:**
- Primary sources work without backend
- For Flux AI, start Flask backend: `cd backend && python app.py`
- Check backend logs for errors

### Issue: Slow performance
**Solution:**
1. Check internet connection
2. Try different quality mode
3. Clear browser cache
4. Restart development server

---

## 📚 Feature Overview

### 🖼️ Image Intelligence
| Feature | What it Does | Use Case |
|---------|--------------|----------|
| Image Analysis | Extract insights from any image | Understand content quickly |
| Object Detection | Identify all objects in image | Catalog and organize images |
| Scene Understanding | Describe environment and context | Generate captions |
| Color Extraction | Find dominant colors | Design color palettes |
| Tag Generation | Auto-generate relevant tags | Improve SEO and searchability |
| OCR | Extract text from images | Digitize documents |

### 💬 Text Intelligence
| Feature | What it Does | Use Case |
|---------|--------------|----------|
| Summarization | Condense long text | Save reading time |
| Sentiment Analysis | Detect emotions and tone | Analyze feedback |
| Entity Extraction | Find key people, places, concepts | Build knowledge graphs |
| Content Generation | Create new content | Speed up writing |
| Keyword Extraction | Identify important terms | SEO optimization |

### 🎙️ Voice Intelligence
| Feature | What it Does | Use Case |
|---------|--------------|----------|
| Text-to-Speech | Convert text to natural voice | Accessibility |
| Audio Controls | Play, pause, stop narration | Control playback |
| Multiple Voices | Choose different voice options | Personalization |

---

## 🔑 Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search/input
- `Ctrl/Cmd + Enter` - Submit form
- `Escape` - Close modal/dropdown
- `Ctrl/Cmd + R` - Regenerate content

---

## 💡 Tips & Best Practices

### For Best Image Analysis:
✓ Use high-quality, clear images
✓ Good lighting and focus
✓ Avoid heavily compressed images
✓ Single subject works best

### For Best Text Processing:
✓ Provide context when needed
✓ Use proper formatting
✓ Keep prompts clear and specific
✓ Try different styles/tones

### For Best Content Generation:
✓ Be specific in your prompts
✓ Mention desired length
✓ Specify target audience
✓ Include key points to cover

---

## 📊 Understanding Results

### Confidence Scores
- **90-100%**: Very reliable
- **75-89%**: Reliable
- **60-74%**: Moderate confidence
- **Below 60%**: Review manually

### Quality Indicators
- **Excellent**: Professional grade
- **Good**: Minor improvements possible
- **Fair**: Several improvements needed
- **Poor**: Major issues detected

---

## 🚀 Next Steps

### Learn More
- Read [HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md) for full details
- Check [README.md](./README.md) for comprehensive documentation
- Explore inline code comments for technical details

### Provide Feedback
- Found a bug? Create an issue on GitHub
- Have a suggestion? Open a discussion
- Want to contribute? Submit a pull request

### Deploy to Production
1. Build: `npm run build`
2. Deploy to Vercel/Netlify/AWS
3. Configure production environment variables
4. Enable HTTPS
5. Set up monitoring and analytics

---

## 🎉 Congratulations!

You're now ready to use Visora! Explore all features and experience the power of unified AI intelligence.

**Need Help?**
- 📖 Read the full documentation
- 💬 Check GitHub discussions
- 📧 Contact support
- 🎥 Watch demo videos

**Happy Creating! 🎨**
