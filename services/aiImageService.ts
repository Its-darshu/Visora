// Advanced AI Image Generation Service
// This service provides intelligent image generation with multiple fallbacks

export interface ImageGenerationRequest {
  prompt: string;
  topic?: string;
  style?: 'educational' | 'realistic' | 'artistic' | 'scientific';
  quality?: 'high' | 'medium' | 'fast';
}

export interface ImageGenerationResponse {
  url: string;
  source: string;
  success: boolean;
  metadata?: {
    actualPrompt: string;
    processingTime: number;
  };
}

class AIImageService {
  private cache = new Map<string, string>();
  
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    const enhancedPrompt = this.enhancePrompt(request);
    
    // Check cache first
    const cacheKey = this.getCacheKey(enhancedPrompt);
    if (this.cache.has(cacheKey)) {
      return {
        url: this.cache.get(cacheKey)!,
        source: 'cache',
        success: true,
        metadata: {
          actualPrompt: enhancedPrompt,
          processingTime: Date.now() - startTime
        }
      };
    }

    // Try different generation methods
    const generators = [
      () => this.generateWithFlux(enhancedPrompt),
      () => this.generateWithPollinations(enhancedPrompt),
      () => this.generateWithIntelligentUnsplash(enhancedPrompt, request.topic),
      () => this.generateWithPicsum(enhancedPrompt),
    ];

    for (const generator of generators) {
      try {
        const result = await generator();
        if (result.success && result.url) {
          // Cache successful result
          this.cache.set(cacheKey, result.url);
          return {
            ...result,
            metadata: {
              actualPrompt: enhancedPrompt,
              processingTime: Date.now() - startTime
            }
          };
        }
      } catch (error) {
        console.warn(`Image generation method failed:`, error);
      }
    }

    // Final fallback
    return this.getFallbackImage(request.topic);
  }

  private enhancePrompt(request: ImageGenerationRequest): string {
    let prompt = request.prompt;
    
    // Clean up common instructional text
    prompt = prompt
      .replace(/vibrant and illustrative visual that represents the core idea of:/gi, '')
      .replace(/the style should be educational and visually appealing/gi, '')
      .replace(/like a modern textbook illustration/gi, '')
      .replace(/avoid text in the image/gi, '')
      .replace(/["""]/g, '')
      .trim();

    // Add style-specific enhancements
    const styleMap = {
      educational: 'clear, informative, diagram-style',
      realistic: 'photorealistic, detailed, high resolution',
      artistic: 'artistic, creative, visually appealing',
      scientific: 'scientific illustration, precise, technical'
    };

    const style = styleMap[request.style || 'educational'];
    return `${prompt}, ${style}, professional quality`;
  }

  private getCacheKey(prompt: string): string {
    return btoa(prompt).slice(0, 20);
  }

  // Use Hugging Face Flux model via MCP
  private async generateWithFlux(prompt: string): Promise<ImageGenerationResponse> {
    try {
      // Use the MCP Hugging Face Flux model for the best AI image generation
      const result = await this.callHuggingFaceFlux(prompt);
      if (result) {
        return { url: result, source: 'huggingface-flux', success: true };
      }
    } catch (error) {
      console.warn('Hugging Face Flux generation failed:', error);
    }
    
    return { url: '', source: 'flux', success: false };
  }

  // Helper to call Hugging Face Flux model
  private async callHuggingFaceFlux(prompt: string): Promise<string | null> {
    try {
      // This would integrate with the Hugging Face MCP tools
      // For now, we'll prepare the structure for future integration
      return null;
    } catch (error) {
      return null;
    }
  }

  private async generateWithPollinations(prompt: string): Promise<ImageGenerationResponse> {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 10000);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&seed=${seed}&enhance=true&nologo=true`;
      
      return { url, source: 'pollinations', success: true };
    } catch (error) {
      return { url: '', source: 'pollinations', success: false };
    }
  }

  private async generateWithIntelligentUnsplash(prompt: string, topic?: string): Promise<ImageGenerationResponse> {
    const topicCollections: { [key: string]: string[] } = {
      // Science & Technology
      'science': ['1532187863486-abf9dbad1b69', '1507003211169-0a1dd7884af1', '1628948174-e7f8e2c8e5ba'],
      'space': ['1446776653964-20c1d3a81b06', '1502051615341-e67ad37bb0bb', '1419242902214-a76231d76ff1'],
      'technology': ['1555949963-aa79dcee981c', '1507003211169-0a1dd7884af1', '1518709268905-4e92cd382aaa'],
      'ai': ['1555949963-aa79dcee981c', '1507003211169-0a1dd7884af1', '1518709268905-4e92cd382aaa'],
      
      // Nature & Biology
      'nature': ['1441974231531-c6227db76b6e', '1426604966848-d7adac402bcc', '1416879595882-3373a0480b5b'],
      'biology': ['1532187863486-abf9dbad1b69', '1628948174-e7f8e2c8e5ba', '1507003211169-0a1dd7884af1'],
      'ocean': ['1439066615861-d1af74d74000', '1506905925346-21bda4d32df4', '1419242902214-a76231d76ff1'],
      
      // History & Literature
      'history': ['1481627834876-b7833e8f5570', '1507003211169-0a1dd7884af1', '1426604966848-d7adac402bcc'],
      'literature': ['1481627834876-b7833e8f5570', '1509228627373-8e45f8e18f06', '1472214103451-9374bd1c798e'],
      
      // Mathematics & Physics
      'mathematics': ['1635070041078-e363dbe005cb', '1509228627373-8e45f8e18f06', '1518709268905-4e92cd382aaa'],
      'physics': ['1635070041078-e363dbe005cb', '1507003211169-0a1dd7884af1', '1518709268905-4e92cd382aaa'],
    };

    // Find best matching collection
    const promptLower = prompt.toLowerCase();
    let selectedPhoto = null;

    // First try exact topic match
    if (topic && topicCollections[topic.toLowerCase()]) {
      const photos = topicCollections[topic.toLowerCase()];
      selectedPhoto = photos[Math.floor(Math.random() * photos.length)];
    } else {
      // Try keyword matching
      for (const [topicKey, photos] of Object.entries(topicCollections)) {
        if (promptLower.includes(topicKey)) {
          selectedPhoto = photos[Math.floor(Math.random() * photos.length)];
          break;
        }
      }
    }

    if (selectedPhoto) {
      const url = `https://images.unsplash.com/photo-${selectedPhoto}?w=800&h=450&fit=crop&crop=center&q=80`;
      return { url, source: 'unsplash', success: true };
    }

    return { url: '', source: 'unsplash', success: false };
  }

  private async generateWithPicsum(prompt: string): Promise<ImageGenerationResponse> {
    try {
      const seed = prompt.length + Date.now();
      const url = `https://picsum.photos/seed/${seed}/800/450`;
      return { url, source: 'picsum', success: true };
    } catch (error) {
      return { url: '', source: 'picsum', success: false };
    }
  }

  private getFallbackImage(topic?: string): ImageGenerationResponse {
    const fallbackImages = [
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=450&fit=crop&crop=center&q=80', // Books
      'https://images.unsplash.com/photo-1507003211169-0a1dd7884af1?w=800&h=450&fit=crop&crop=center&q=80', // Laboratory
      'https://images.unsplash.com/photo-1509228627373-8e45f8e18f06?w=800&h=450&fit=crop&crop=center&q=80', // Education
    ];

    const url = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    return { url, source: 'fallback', success: true };
  }

  // Clear cache when needed
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const aiImageService = new AIImageService();