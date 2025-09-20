
import { GoogleGenAI, Type } from "@google/genai";
import type { Lesson } from '../types';

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


export const generateImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '16:9',
    },
  });

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  if (!base64ImageBytes) {
      throw new Error("No image bytes returned from API.");
  }

  return `data:image/png;base64,${base64ImageBytes}`;
};
