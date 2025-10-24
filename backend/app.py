# Hugging Face Flux API Service + Image Analysis
# Flask backend for AI image generation and text extraction using Hugging Face models and Gemini AI

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import io
import os
from PIL import Image
import time
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import google.generativeai as genai

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("⚠️  Warning: pytesseract not available. OCR will use AI only.")

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("⚠️  Warning: PyPDF2 not available. PDF text extraction will not work.")
    print("   Install with: pip install PyPDF2")

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS for production
frontend_url = os.getenv('FRONTEND_URL', '*')
CORS(app, origins=[frontend_url, 'http://localhost:5173', 'http://localhost:3000'])
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create uploads folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Hugging Face configuration
HF_API_TOKEN = os.getenv('HUGGINGFACE_API_TOKEN')
HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"

# Gemini AI configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini AI configured successfully")
else:
    print("⚠️  Warning: GEMINI_API_KEY not configured properly")
    print("   Add your key to backend/.env file")
    print("   Get key from: https://makersuite.google.com/app/apikey")

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

# ============================================
# IMAGE ANALYSIS ENDPOINTS
# ============================================

def extract_text_from_image(image_path):
    """Extract text from image or describe image content using AI."""
    try:
        # Try Tesseract first if available
        if TESSERACT_AVAILABLE:
            try:
                img = Image.open(image_path)
                text = pytesseract.image_to_string(img)
                if text.strip():
                    return text.strip()
            except Exception:
                pass

        # Use Gemini Vision for image analysis
        if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            img = Image.open(image_path)

            prompt = """Analyze this image carefully.

If there is TEXT in the image:
- Extract all text exactly as shown
- Preserve formatting and structure
- List any questions clearly

If there is NO TEXT or very little text:
- Describe what you see in detail
- Explain what the image represents
- Identify objects, people, places, or activities
- Describe colors, setting, and mood
- Explain the context or purpose of the image

Be thorough and descriptive."""

            response = model.generate_content([prompt, img])
            return response.text.strip()

        return "Could not analyze image - No AI service available"
    except Exception as e:
        return f"Error analyzing image: {str(e)}"


def analyze_with_ai(content, prompt=None):
    """Analyze content using Gemini AI."""
    try:
        if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
            return "Error: GEMINI_API_KEY not configured. Please add your Gemini API key to backend/.env file. Get key from: https://makersuite.google.com/app/apikey"

        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        if prompt:
            # User provided custom prompt
            full_prompt = f"""{prompt}

Content:
{content}

IMPORTANT: Write in natural, conversational language.
- Use simple, clear sentences
- Explain like you're talking to a friend
- NO markdown symbols (no ##, **, etc.)
- Use "First," "Second," instead of "1." "2."
- Write in paragraphs with proper spacing
- Be conversational and helpful
- Give complete, accurate answers

Make it easy to read and understand."""
        else:
            # Auto-generate intelligent analysis
            full_prompt = f"""Analyze this content and provide a helpful response.

Content:
{content}

IMPORTANT INSTRUCTIONS:
- Write in natural, conversational English
- NO markdown symbols (no ##, **, ###, etc.)
- Use simple headings like "Summary:" or "Key Points:"
- Explain things clearly like talking to a friend
- Use "First," "Second," "Third" instead of numbers
- Write in complete sentences and paragraphs
- Be warm, friendly, and helpful
- Give accurate, detailed information

Structure your response naturally:

SUMMARY:
Give a brief overview in 2-3 sentences.

KEY POINTS:
List the main points in a clear, easy-to-read way.

DETAILED EXPLANATION:
Explain everything thoroughly and clearly.

QUESTIONS AND ANSWERS:
If there are questions in the content, answer each one completely and accurately.

RECOMMENDATIONS:
Suggest helpful next steps or insights.

Write everything in clear, natural language that's easy to understand."""

        response = model.generate_content(full_prompt)
        return response.text.strip()

    except Exception as e:
        return f"Error analyzing content: {str(e)}"


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and text extraction."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Detect file type and extract text
        ext = filename.lower().split('.')[-1]
        extracted_text = ""

        if ext in ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp']:
            extracted_text = extract_text_from_image(filepath)
        else:
            os.remove(filepath)
            return jsonify({'error': 'Unsupported file type. Please upload an image.'}), 400

        # Clean up file
        os.remove(filepath)

        return jsonify({
            'success': True,
            'filename': filename,
            'fileType': ext,
            'extractedText': extracted_text[:500],  # Preview
            'fullText': extracted_text
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_content():
    """Analyze content with AI."""
    try:
        data = request.json
        content = data.get('content', '')
        prompt = data.get('prompt', None)

        if not content:
            return jsonify({'error': 'No content provided'}), 400

        result = analyze_with_ai(content, prompt)

        return jsonify({
            'success': True,
            'result': result
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/extract-pdf', methods=['POST'])
def extract_pdf_text():
    """Extract text from PDF file - handles large PDFs up to 500 pages."""
    try:
        if not PDF_AVAILABLE:
            return jsonify({'error': 'PyPDF2 not installed. Install with: pip install PyPDF2'}), 500

        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400

        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Extract text from PDF
        extracted_text = ""
        page_texts = []
        
        with open(filepath, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            num_pages = len(pdf_reader.pages)
            
            print(f"📄 Processing PDF: {filename} ({num_pages} pages)")
            
            # Process all pages (no limit)
            for page_num in range(num_pages):
                try:
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    if page_text.strip():
                        page_texts.append(f"--- Page {page_num + 1} ---\n{page_text}")
                        extracted_text += page_text + "\n\n"
                except Exception as page_error:
                    print(f"⚠️  Error extracting page {page_num + 1}: {str(page_error)}")
                    continue

        # Clean up file
        os.remove(filepath)

        if not extracted_text.strip():
            return jsonify({'error': 'Could not extract text from PDF. It might be scanned or image-based.'}), 400

        # Calculate text statistics
        word_count = len(extracted_text.split())
        char_count = len(extracted_text)
        
        print(f"✅ Extracted {word_count} words from {num_pages} pages")

        return jsonify({
            'success': True,
            'text': extracted_text.strip(),
            'pages': num_pages,
            'filename': filename,
            'wordCount': word_count,
            'charCount': char_count,
            'preview': extracted_text[:1000] + '...' if len(extracted_text) > 1000 else extracted_text
        })

    except Exception as e:
        # Clean up file on error
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        print(f"❌ PDF extraction error: {str(e)}")
        return jsonify({'error': f'PDF extraction failed: {str(e)}'}), 500

# ============================================
# END IMAGE ANALYSIS ENDPOINTS
# ============================================

if __name__ == '__main__':
    # Check for required environment variables
    if not HF_API_TOKEN:
        print("⚠️  Warning: HUGGINGFACE_API_TOKEN not found in environment variables")
        print("   Please set your Hugging Face API token in .env file")
    else:
        print("✅ Hugging Face API token loaded successfully")
    
    # Check PyPDF2 availability
    if PDF_AVAILABLE:
        print("✅ PyPDF2 available - PDF text extraction enabled (supports 200+ pages)")
    else:
        print("⚠️  PyPDF2 not available - PDF text extraction disabled")
        print("   Install with: pip install PyPDF2")
    
    print("🚀 Starting Hugging Face Flux API Service...")
    print("📡 Service will be available at: http://localhost:5000")
    print("🎨 Ready to generate educational images!")
    
    app.run(debug=True, host='0.0.0.0', port=5000)