// Image Analysis Service - Extract text and analyze images using AI
// Integrates with Gemini AI for intelligent image understanding

export interface ImageAnalysisRequest {
  file: File;
  customPrompt?: string;
}

export interface ImageAnalysisResponse {
  success: boolean;
  extractedText?: string;
  aiAnalysis?: string;
  fileName?: string;
  fileType?: string;
  error?: string;
}

class ImageAnalysisService {
  private apiUrl = 'http://localhost:5000/api';
  
  /**
   * Upload and analyze an image file
   * Extracts text using OCR and provides AI-powered analysis
   */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    try {
      const { file, customPrompt } = request;
      
      // Validate file type
      if (!this.isValidImageFile(file)) {
        return {
          success: false,
          error: 'Please upload a valid image file (JPG, PNG, GIF, BMP, WEBP)'
        };
      }
      
      // Validate file size (16MB max)
      if (file.size > 16 * 1024 * 1024) {
        return {
          success: false,
          error: 'File size must be less than 16MB'
        };
      }
      
      // Step 1: Upload file and extract text
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch(`${this.apiUrl}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        return {
          success: false,
          error: errorData.error || 'Failed to upload image'
        };
      }
      
      const uploadData = await uploadResponse.json();
      const { fullText, filename, fileType } = uploadData;
      
      // Step 2: Analyze with AI
      const analyzeResponse = await fetch(`${this.apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: fullText,
          prompt: customPrompt || null
        })
      });
      
      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        return {
          success: false,
          error: errorData.error || 'Failed to analyze image'
        };
      }
      
      const analyzeData = await analyzeResponse.json();
      
      return {
        success: true,
        extractedText: fullText,
        aiAnalysis: analyzeData.result,
        fileName: filename || file.name,
        fileType: fileType
      };
      
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
  
  /**
   * Validate if the file is a supported image format
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ];
    
    return validTypes.includes(file.type.toLowerCase());
  }
  
  /**
   * Create a preview URL for the uploaded image
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }
  
  /**
   * Clean up preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export const imageAnalysisService = new ImageAnalysisService();
