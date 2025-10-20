// Vision Intelligence Service
// Handles image analysis, object detection, and visual understanding using Gemini Vision API

import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface ImageAnalysisResult {
  summary: string;
  detectedObjects: string[];
  sceneDescription: string;
  colors: string[];
  mood: string;
  tags: string[];
  suggestions: string[];
  confidence: number;
}

export interface ObjectDetectionResult {
  objects: Array<{
    name: string;
    confidence: number;
    category: string;
  }>;
  count: number;
}

export interface ImageEnhancementSuggestions {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  improvements: string[];
  technicalIssues: string[];
  recommendations: string[];
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A comprehensive 2-3 sentence summary of what the image contains"
    },
    detectedObjects: {
      type: Type.ARRAY,
      description: "List of all objects, people, or items detected in the image",
      items: { type: Type.STRING }
    },
    sceneDescription: {
      type: Type.STRING,
      description: "Description of the overall scene, setting, or environment"
    },
    colors: {
      type: Type.ARRAY,
      description: "Dominant colors present in the image",
      items: { type: Type.STRING }
    },
    mood: {
      type: Type.STRING,
      description: "The overall mood, atmosphere, or emotion conveyed by the image"
    },
    tags: {
      type: Type.ARRAY,
      description: "Relevant tags or keywords for categorizing the image",
      items: { type: Type.STRING }
    },
    suggestions: {
      type: Type.ARRAY,
      description: "Suggestions for how this image could be improved or used",
      items: { type: Type.STRING }
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score for the analysis (0-100)"
    }
  },
  required: ["summary", "detectedObjects", "sceneDescription", "colors", "mood", "tags", "suggestions", "confidence"]
};

/**
 * Analyze an image and extract comprehensive insights
 */
export const analyzeImage = async (imageFile: File): Promise<ImageAnalysisResult> => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Analyze this image in detail and provide:
1. A comprehensive summary of what you see
2. All objects, people, or items you can detect
3. Description of the scene and environment
4. Dominant colors present
5. The mood or atmosphere conveyed
6. Relevant tags for categorization
7. Suggestions for improvement or usage
8. Your confidence level in this analysis (0-100)

Be thorough and specific in your analysis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: prompt },
            { 
              inlineData: {
                mimeType: imageFile.type,
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as ImageAnalysisResult;
    
    console.log('Image analysis completed:', result);
    return result;
    
  } catch (error) {
    console.error('Image analysis failed:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

/**
 * Detect and classify objects in an image
 */
export const detectObjects = async (imageFile: File): Promise<ObjectDetectionResult> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Detect and list all objects in this image. For each object provide:
- Name of the object
- Confidence level (0-100)
- Category (person, animal, vehicle, furniture, electronics, food, nature, building, etc.)

Format as JSON with structure: { "objects": [{"name": string, "confidence": number, "category": string}], "count": number }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: prompt },
            { 
              inlineData: {
                mimeType: imageFile.type,
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ObjectDetectionResult;
    
  } catch (error) {
    console.error('Object detection failed:', error);
    throw new Error('Failed to detect objects. Please try again.');
  }
};

/**
 * Get suggestions for image enhancement
 */
export const getEnhancementSuggestions = async (imageFile: File): Promise<ImageEnhancementSuggestions> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Analyze this image for technical quality and provide:
1. Overall quality assessment (excellent/good/fair/poor)
2. List of improvements that could enhance the image
3. Any technical issues detected (blur, noise, poor lighting, etc.)
4. Specific recommendations for enhancement

Format as JSON with structure: { "quality": string, "improvements": string[], "technicalIssues": string[], "recommendations": string[] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: prompt },
            { 
              inlineData: {
                mimeType: imageFile.type,
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ImageEnhancementSuggestions;
    
  } catch (error) {
    console.error('Enhancement analysis failed:', error);
    throw new Error('Failed to analyze image quality. Please try again.');
  }
};

/**
 * Compare two images and find similarities/differences
 */
export const compareImages = async (image1: File, image2: File): Promise<{
  similarities: string[];
  differences: string[];
  analysis: string;
}> => {
  try {
    const base64Image1 = await fileToBase64(image1);
    const base64Image2 = await fileToBase64(image2);
    
    const prompt = `Compare these two images and provide:
1. Similarities between them
2. Differences between them
3. Overall analysis of the comparison

Format as JSON: { "similarities": string[], "differences": string[], "analysis": string }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: prompt },
            { 
              inlineData: {
                mimeType: image1.type,
                data: base64Image1
              }
            },
            { 
              inlineData: {
                mimeType: image2.type,
                data: base64Image2
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
    
  } catch (error) {
    console.error('Image comparison failed:', error);
    throw new Error('Failed to compare images. Please try again.');
  }
};

/**
 * Extract text from image (OCR)
 */
export const extractTextFromImage = async (imageFile: File): Promise<{
  text: string;
  language: string;
  confidence: number;
}> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Extract all visible text from this image. Provide:
1. The extracted text (maintain formatting if possible)
2. The detected language
3. Confidence level (0-100)

Format as JSON: { "text": string, "language": string, "confidence": number }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: prompt },
            { 
              inlineData: {
                mimeType: imageFile.type,
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
    
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw new Error('Failed to extract text from image. Please try again.');
  }
};

/**
 * Helper function to convert File to base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Generate smart search queries based on image content
 */
export const generateSearchQueries = async (imageFile: File): Promise<string[]> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Analyze this image and generate 5-7 relevant search queries that someone might use to find similar images or information about what's shown.

Format as JSON array: ["query1", "query2", ...]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: prompt },
            { 
              inlineData: {
                mimeType: imageFile.type,
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
    
  } catch (error) {
    console.error('Search query generation failed:', error);
    throw new Error('Failed to generate search queries. Please try again.');
  }
};

export const visionService = {
  analyzeImage,
  detectObjects,
  getEnhancementSuggestions,
  compareImages,
  extractTextFromImage,
  generateSearchQueries
};
