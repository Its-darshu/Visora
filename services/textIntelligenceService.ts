// Text Intelligence Service
// Advanced NLP capabilities: summarization, sentiment analysis, entity extraction

import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface TextSummary {
  summary: string;
  keyPoints: string[];
  wordCount: {
    original: number;
    summary: number;
  };
  readingTime: {
    original: number;
    summary: number;
  };
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral' | 'mixed';
  score: number; // -1 to 1
  emotions: {
    name: string;
    intensity: number;
  }[];
  confidence: number;
}

export interface EntityExtraction {
  entities: {
    text: string;
    type: 'person' | 'organization' | 'location' | 'date' | 'concept' | 'other';
    relevance: number;
  }[];
  relationships: {
    entity1: string;
    relation: string;
    entity2: string;
  }[];
}

export interface ContentGeneration {
  content: string;
  style: string;
  tone: string;
  wordCount: number;
}

/**
 * Summarize long text intelligently
 */
export const summarizeText = async (
  text: string,
  maxLength: 'short' | 'medium' | 'long' = 'medium'
): Promise<TextSummary> => {
  try {
    const lengthGuide = {
      short: '1-2 sentences',
      medium: '3-5 sentences',
      long: '1-2 paragraphs'
    };

    const prompt = `Summarize the following text in ${lengthGuide[maxLength]}. Also provide:
- 3-5 key points from the text
- Original word count
- Summary word count
- Reading time for both (assume 200 words/minute)

Text to summarize:
"""
${text}
"""

Format as JSON: {
  "summary": string,
  "keyPoints": string[],
  "wordCount": {"original": number, "summary": number},
  "readingTime": {"original": number, "summary": number}
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as TextSummary;
  } catch (error) {
    console.error('Text summarization failed:', error);
    throw new Error('Failed to summarize text. Please try again.');
  }
};

/**
 * Analyze sentiment and emotions in text
 */
export const analyzeSentiment = async (text: string): Promise<SentimentAnalysis> => {
  try {
    const prompt = `Analyze the sentiment and emotions in this text. Provide:
- Overall sentiment (positive/negative/neutral/mixed)
- Sentiment score from -1 (most negative) to 1 (most positive)
- Detected emotions with intensity (0-100)
- Confidence level (0-100)

Text to analyze:
"""
${text}
"""

Format as JSON: {
  "overall": string,
  "score": number,
  "emotions": [{"name": string, "intensity": number}],
  "confidence": number
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SentimentAnalysis;
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    throw new Error('Failed to analyze sentiment. Please try again.');
  }
};

/**
 * Extract entities and relationships from text
 */
export const extractEntities = async (text: string): Promise<EntityExtraction> => {
  try {
    const prompt = `Extract all important entities and their relationships from this text:
- Identify entities (people, organizations, locations, dates, concepts)
- Determine relationships between entities
- Rate relevance (0-100) for each entity

Text to analyze:
"""
${text}
"""

Format as JSON: {
  "entities": [{"text": string, "type": string, "relevance": number}],
  "relationships": [{"entity1": string, "relation": string, "entity2": string}]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as EntityExtraction;
  } catch (error) {
    console.error('Entity extraction failed:', error);
    throw new Error('Failed to extract entities. Please try again.');
  }
};

/**
 * Generate content based on prompt and style
 */
export const generateContent = async (
  prompt: string,
  style: 'professional' | 'casual' | 'academic' | 'creative' = 'professional',
  tone: 'formal' | 'friendly' | 'persuasive' | 'informative' = 'informative',
  length: 'short' | 'medium' | 'long' = 'medium'
): Promise<ContentGeneration> => {
  try {
    const lengthWords = {
      short: '100-200 words',
      medium: '300-500 words',
      long: '600-1000 words'
    };

    const generationPrompt = `Generate content with the following requirements:

Prompt: ${prompt}
Style: ${style}
Tone: ${tone}
Length: ${lengthWords[length]}

Provide the generated content along with metadata.

Format as JSON: {
  "content": string,
  "style": string,
  "tone": string,
  "wordCount": number
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generationPrompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ContentGeneration;
  } catch (error) {
    console.error('Content generation failed:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
};

/**
 * Detect language and translate text
 */
export const translateText = async (
  text: string,
  targetLanguage: string = 'en'
): Promise<{
  originalLanguage: string;
  translatedText: string;
  confidence: number;
}> => {
  try {
    const prompt = `Detect the language of this text and translate it to ${targetLanguage}:

"""
${text}
"""

Format as JSON: {
  "originalLanguage": string,
  "translatedText": string,
  "confidence": number
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Translation failed:', error);
    throw new Error('Failed to translate text. Please try again.');
  }
};

/**
 * Generate keywords and tags from text
 */
export const generateKeywords = async (text: string): Promise<string[]> => {
  try {
    const prompt = `Extract 5-10 relevant keywords and tags from this text:

"""
${text}
"""

Return as JSON array: ["keyword1", "keyword2", ...]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Keyword generation failed:', error);
    throw new Error('Failed to generate keywords. Please try again.');
  }
};

/**
 * Check text for grammar and style issues
 */
export const checkWriting = async (text: string): Promise<{
  issues: Array<{
    type: 'grammar' | 'spelling' | 'style' | 'clarity';
    message: string;
    suggestion: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  overallScore: number;
  improvements: string[];
}> => {
  try {
    const prompt = `Analyze this text for grammar, spelling, style, and clarity issues:

"""
${text}
"""

Provide specific issues with suggestions, an overall quality score (0-100), and general improvements.

Format as JSON: {
  "issues": [{"type": string, "message": string, "suggestion": string, "severity": string}],
  "overallScore": number,
  "improvements": string[]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Writing check failed:', error);
    throw new Error('Failed to check writing. Please try again.');
  }
};

export const textIntelligenceService = {
  summarizeText,
  analyzeSentiment,
  extractEntities,
  generateContent,
  translateText,
  generateKeywords,
  checkWriting
};
