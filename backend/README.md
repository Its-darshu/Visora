# Personal Tutor Backend

Flask backend service for AI image generation using Hugging Face Flux models.

## Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure Environment:**
Copy `.env` file and add your Hugging Face API token:
```bash
HUGGINGFACE_API_TOKEN=your_actual_hugging_face_token_here
```

3. **Get Hugging Face API Token:**
- Visit https://huggingface.co/settings/tokens
- Create a new token with "Read" permissions
- Copy the token to your `.env` file

## Running the Service

```bash
cd backend
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Generate Image
```
POST /generate-image
Content-Type: application/json

{
  "prompt": "Educational illustration of photosynthesis",
  "width": 800,
  "height": 450
}
```

### List Models
```
GET /models
```

## Features

- **High-Quality AI Images:** Uses Hugging Face FLUX.1-schnell model
- **Educational Enhancement:** Automatically enhances prompts for educational content
- **Error Handling:** Graceful handling of model loading states and API errors
- **CORS Support:** Configured for frontend integration
- **Base64 Response:** Returns images as base64 data URLs for immediate use

## Model Information

- **Model:** FLUX.1-schnell by Black Forest Labs
- **Speed:** Fast inference (typically 5-15 seconds)
- **Quality:** High-quality, detailed images
- **Resolution:** Supports up to 1024x1024 pixels
- **Style:** Optimized for educational and instructional content