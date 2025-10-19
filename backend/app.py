# Hugging Face Flux API Service
# Flask backend for AI image generation using Hugging Face models

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import io
import os
from PIL import Image
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Hugging Face configuration
HF_API_TOKEN = os.getenv('HUGGINGFACE_API_TOKEN')
HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"

# Headers for Hugging Face API
headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
    "Content-Type": "application/json"
}

def enhance_prompt_for_education(prompt):
    """Advanced prompt enhancement for superior educational content"""
    educational_keywords = [
        "professional educational illustration", "high-quality textbook diagram", 
        "clear scientific illustration", "detailed academic visual", 
        "crisp educational infographic", "professional learning material",
        "high-resolution educational content", "detailed instructional diagram"
    ]
    
    # Clean the prompt thoroughly
    clean_prompt = prompt.strip()
    
    # Remove common noise words
    noise_words = [
        "vibrant and illustrative visual that represents the core idea of:",
        "the style should be educational and visually appealing",
        "like a modern textbook illustration",
        "avoid text in the image",
        "image should be",
        "create an image",
        "generate a picture"
    ]
    
    for noise in noise_words:
        clean_prompt = clean_prompt.replace(noise, "").strip()
    
    # Advanced educational enhancement
    if not any(keyword in clean_prompt.lower() for keyword in ['educational', 'learning', 'textbook', 'academic', 'professional']):
        clean_prompt += ", professional educational illustration, high-quality textbook style, detailed and informative"
    
    # Add quality enhancers
    quality_enhancers = [
        "ultra-high quality", "detailed", "crisp", "professional", 
        "8k resolution", "sharp focus", "masterpiece", "best quality"
    ]
    
    clean_prompt += f", {', '.join(quality_enhancers[:4])}"
    
    return clean_prompt

def query_huggingface_flux(prompt, width=800, height=450, quality_mode="high"):
    """Enhanced Hugging Face Flux query with quality optimizations"""
    enhanced_prompt = enhance_prompt_for_education(prompt)
    
    # Quality-based parameter optimization
    if quality_mode == "ultra":
        steps = 30
        guidance = 7.5
        width = min(width * 1.5, 1024)  # Increase resolution
        height = min(height * 1.5, 1024)
    elif quality_mode == "high":
        steps = 25
        guidance = 5.0
        width = min(width * 1.25, 1024)
        height = min(height * 1.25, 1024)
    else:  # standard
        steps = 20
        guidance = 3.5
    
    payload = {
        "inputs": enhanced_prompt,
        "parameters": {
            "width": int(width),
            "height": int(height),
            "num_inference_steps": steps,
            "guidance_scale": guidance,
            "negative_prompt": "blurry, low quality, pixelated, distorted, ugly, bad anatomy, text, watermark, logo, signature",
        }
    }
    
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            return response.content
        elif response.status_code == 503:
            # Model is loading
            return {"error": "model_loading", "estimated_time": 20}
        else:
            return {"error": f"API error: {response.status_code}", "details": response.text}
            
    except requests.exceptions.Timeout:
        return {"error": "timeout", "message": "Request timed out"}
    except Exception as e:
        return {"error": "request_failed", "message": str(e)}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Hugging Face Flux API",
        "timestamp": time.time()
    })

@app.route('/generate-image', methods=['POST'])
def generate_image():
    """Enhanced image generation with quality controls"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({
                "error": "missing_prompt",
                "message": "Prompt is required"
            }), 400
        
        prompt = data['prompt']
        width = data.get('width', 800)
        height = data.get('height', 450)
        quality_mode = data.get('quality_mode', 'high')  # standard, high, ultra
        
        # Validate dimensions
        if width > 1024 or height > 1024 or width < 256 or height < 256:
            return jsonify({
                "error": "invalid_dimensions",
                "message": "Width and height must be between 256 and 1024 pixels"
            }), 400
        
        # Validate quality mode
        if quality_mode not in ['standard', 'high', 'ultra']:
            quality_mode = 'high'
        
        print(f"Generating {quality_mode} quality image for prompt: {prompt}")
        
        # Query Hugging Face with quality settings
        result = query_huggingface_flux(prompt, width, height, quality_mode)
        
        if isinstance(result, dict) and 'error' in result:
            # Handle different error types
            if result['error'] == 'model_loading':
                return jsonify({
                    "error": "model_loading",
                    "message": "Model is loading, please try again in a few seconds",
                    "retry_after": result.get('estimated_time', 20)
                }), 503
            else:
                return jsonify(result), 500
        
        # Enhanced image processing
        try:
            # Verify it's a valid image
            image = Image.open(io.BytesIO(result))
            
            # Quality enhancement post-processing
            if quality_mode in ['high', 'ultra']:
                # Enhance image quality
                image = enhance_image_quality(image)
            
            # Convert to base64
            buffered = io.BytesIO()
            image.save(buffered, format="PNG", quality=95, optimize=True)
            img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            return jsonify({
                "success": True,
                "image": f"data:image/png;base64,{img_base64}",
                "metadata": {
                    "model": "FLUX.1-schnell",
                    "prompt": prompt,
                    "dimensions": f"{width}x{height}",
                    "quality_mode": quality_mode,
                    "timestamp": time.time()
                }
            })
            
        except Exception as e:
            return jsonify({
                "error": "image_processing_failed",
                "message": f"Failed to process generated image: {str(e)}"
            }), 500
            
    except Exception as e:
        print(f"Error in generate_image: {str(e)}")
        return jsonify({
            "error": "internal_server_error",
            "message": str(e)
        }), 500

def enhance_image_quality(image):
    """Post-process image for enhanced quality"""
    try:
        from PIL import ImageEnhance, ImageFilter
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.2)
        
        # Enhance contrast slightly
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.1)
        
        # Enhance color saturation for educational content
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.1)
        
        return image
    except Exception as e:
        print(f"Image enhancement failed: {e}")
        return image  # Return original if enhancement fails

@app.route('/test-quality', methods=['POST'])
def test_quality_modes():
    """Test endpoint to compare different quality modes"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', 'educational diagram of photosynthesis')
        
        results = {}
        
        for quality in ['standard', 'high', 'ultra']:
            print(f"Testing {quality} quality mode...")
            
            result = query_huggingface_flux(prompt, 800, 450, quality)
            
            if isinstance(result, dict) and 'error' in result:
                results[quality] = {"error": result['error']}
            else:
                # Just return metadata for comparison
                results[quality] = {
                    "success": True,
                    "size_kb": len(result) // 1024 if result else 0,
                    "quality_mode": quality
                }
        
        return jsonify({
            "prompt": prompt,
            "quality_comparison": results,
            "recommendation": "Use 'high' for best balance of quality and speed"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available models with enhanced capabilities"""
    return jsonify({
        "available_models": [
            {
                "name": "FLUX.1-schnell",
                "description": "Fast, high-quality image generation with educational enhancements",
                "provider": "Black Forest Labs",
                "max_resolution": "1024x1024",
                "supported_formats": ["PNG", "JPEG"],
                "quality_modes": ["standard", "high", "ultra"],
                "features": [
                    "Educational prompt enhancement",
                    "Negative prompt filtering",
                    "Post-processing optimization",
                    "Variable inference steps",
                    "Dynamic resolution scaling"
                ]
            }
        ],
        "enhancements": {
            "prompt_engineering": "Advanced educational keywords and quality enhancers",
            "post_processing": "Sharpness, contrast, and color enhancement",
            "quality_modes": {
                "standard": "20 steps, 3.5 guidance, 800x450",
                "high": "25 steps, 5.0 guidance, 1000x562", 
                "ultra": "30 steps, 7.5 guidance, 1200x675"
            }
        }
    })

if __name__ == '__main__':
    # Check for required environment variables
    if not HF_API_TOKEN:
        print("⚠️  Warning: HUGGINGFACE_API_TOKEN not found in environment variables")
        print("   Please set your Hugging Face API token in .env file")
    else:
        print("✅ Hugging Face API token loaded successfully")
    
    print("🚀 Starting Hugging Face Flux API Service...")
    print("📡 Service will be available at: http://localhost:5000")
    print("🎨 Ready to generate educational images!")
    
    app.run(debug=True, host='0.0.0.0', port=5000)