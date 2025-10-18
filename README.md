
# 🎓 Personal Tutor AI

An intelligent, multimodal learning companion powered by Google's Gemini AI, featuring text lessons, AI-generated images, and voice narration.

## ✨ Features

- 🔐 **Google Authentication** - Secure login with Firebase
- 🧠 **AI-Powered Lessons** - Generate educational content on any topic
- 🎨 **Smart Image Generation** - Multiple AI sources for relevant visuals
- 🔊 **Voice Narration** - Text-to-speech for auditory learning
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🛡️ **Protected Routes** - Secure user experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Cloud account (for Gemini AI)
- Firebase project (for authentication)

### Installation

1. **Clone and install:**
   ```bash
   git clone https://github.com/Its-darshu/Personal-Tutor.git
   cd Personal-Tutor
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   ```bash
   # Get your Gemini API key from: https://makersuite.google.com/app/apikey
   VITE_API_KEY=your_gemini_api_key_here
   
   # Get Firebase config from: https://console.firebase.google.com/
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

## 🔧 API Setup

### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it as `VITE_API_KEY` in your `.env.local`

### Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Google provider
4. Copy configuration values to `.env.local`

## 🔒 Security Note

**Important:** All API keys are now stored in environment variables. Make sure to:
- Never commit `.env.local` to git
- Use `.env.example` as a template for others
- Keep your API keys secure and private

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Font Awesome
- **Authentication**: Firebase Auth
- **AI**: Google Gemini AI
- **Images**: Multiple sources (Pollinations.ai, Unsplash)
- **Routing**: React Router

---

**Made with ❤️ by Its-darshu**
