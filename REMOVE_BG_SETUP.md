# Remove.bg Integration Setup Guide

## What is Remove.bg?

Remove.bg is a professional AI-powered background removal service that provides high-quality results. VISORA integrates with their API for the best background removal experience.

## Free Tier Benefits

- **50 free API calls per month**
- Professional-grade AI background removal
- Better edge detection than local algorithms
- Support for complex images (hair, fur, transparency)
- Fast processing (usually under 2 seconds)

## Setup Instructions

### Step 1: Get Your Free API Key

1. Visit [https://www.remove.bg/api](https://www.remove.bg/api)
2. Click "Get API Key" button
3. Sign up with your email (or use Google/Facebook login)
4. Verify your email address
5. Copy your API key from the dashboard

### Step 2: Add API Key to VISORA

1. Open the `.env` file in the root of your VISORA project
2. Find the line: `VITE_REMOVEBG_API_KEY=your_removebg_api_key_here`
3. Replace `your_removebg_api_key_here` with your actual API key
4. Save the file

Example:
```env
VITE_REMOVEBG_API_KEY=abc123def456ghi789jkl012mno345pqr
```

### Step 3: Restart Development Server

If your dev server is running, restart it to load the new environment variable:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Test Background Removal

1. Go to AI Studio page
2. Click "BACKGROUND REMOVER" mode
3. Upload an image
4. Click "SUBMIT"
5. You should see "Using Remove.bg API" status message

## How It Works

### With Remove.bg API Key (Recommended):
- ✅ Professional AI background removal
- ✅ Handles complex edges (hair, fur)
- ✅ Better transparency quality
- ✅ Faster processing
- ✅ 50 free calls per month

### Without API Key (Fallback):
- ⚡ Local algorithm (free, unlimited)
- 🔧 Basic edge detection
- 📊 Good for simple backgrounds
- 🚀 No external API calls

## API Usage Tracking

You can track your API usage at:
[https://www.remove.bg/users/sign_in](https://www.remove.bg/users/sign_in)

## Pricing (After Free Tier)

- **Preview Plan**: $0.20 per image (low resolution)
- **Full Resolution**: $0.90 per image
- **Subscription Plans**: From $9/month for 40 credits

Most users find the free tier sufficient for testing and personal projects!

## Troubleshooting

### "Remove.bg API failed, falling back to local algorithm"

This means:
1. Your API key might be invalid
2. You've exceeded the free tier limit (50/month)
3. Network connection issue
4. Remove.bg service is temporarily down

VISORA will automatically fall back to the local algorithm in these cases.

### "Cannot find VITE_REMOVEBG_API_KEY"

Make sure:
1. You added the key to `.env` file (not `.env.example`)
2. You restarted the dev server after adding the key
3. The `.env` file is in the root directory (same level as `package.json`)

## Best Practices

1. **Use for important images**: Save your API calls for images where quality matters most
2. **Test locally first**: Use the local algorithm for testing, then switch to Remove.bg for final results
3. **Monitor usage**: Check your dashboard regularly to track remaining credits
4. **High-resolution images**: Remove.bg works best with good quality input images

## Support

- Remove.bg Documentation: [https://www.remove.bg/api](https://www.remove.bg/api)
- VISORA Issues: Create an issue on the GitHub repository

---

**Note**: The local fallback algorithm is always available, so VISORA works without an API key. The Remove.bg integration is optional but recommended for best results! 🎨
