
import { GoogleGenAI, Type } from "@google/genai";
import type { Lesson } from '../types';
import { aiImageService } from './aiImageService';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const lessonSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A concise, engaging title for the lesson."
    },
    introduction: {
      type: Type.STRING,
      description: "A brief introduction to the topic (2-3 sentences)."
    },
    keyConcepts: {
      type: Type.ARRAY,
      description: "A list of 3 key concepts related to the topic.",
      items: {
        type: Type.OBJECT,
        properties: {
          concept: {
            type: Type.STRING,
            description: "The name of the key concept."
          },
          explanation: {
            type: Type.STRING,
            description: "A simple, one-sentence explanation of the concept."
          }
        },
        required: ["concept", "explanation"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "A single, concluding sentence that summarizes the main takeaway of the lesson."
    }
  },
  required: ["title", "introduction", "keyConcepts", "summary"]
};

export const generateLesson = async (topic: string): Promise<Lesson> => {
  const prompt = `Act as an expert educator. Create a concise and engaging lesson plan for the topic: "${topic}". The lesson should be suitable for a beginner. The tone should be clear, encouraging, and easy to understand.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: lessonSchema,
    }
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as Lesson;
  } catch(e) {
    console.error("Failed to parse lesson JSON:", jsonText);
    throw new Error("Received malformed lesson data from API.");
  }
};


// Enhanced image generation with multiple AI sources and intelligent fallbacks
export const generateImage = async (prompt: string): Promise<string> => {
  console.log('Generating image for prompt:', prompt);
  
  try {
    // Use the advanced AI image service
    const result = await aiImageService.generateImage({
      prompt,
      style: 'educational',
      quality: 'high'
    });
    
    console.log(`Image generated successfully via ${result.source}:`, result.url);
    return result.url;
  } catch (error) {
    console.error('All image generation methods failed:', error);
    
    // Final emergency fallback
    return 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=450&fit=crop&crop=center&q=80';
  }
};


