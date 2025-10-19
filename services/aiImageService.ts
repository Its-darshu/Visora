// Advanced AI Image Generation Service
// This service provides intelligent image generation with multiple fallbacks

export interface ImageGenerationRequest {
  prompt: string;
  topic?: string;
  style?: 'educational' | 'realistic' | 'artistic' | 'scientific';
  quality?: 'standard' | 'high' | 'ultra';
  dimensions?: {
    width: number;
    height: number;
  };
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

    // Try different generation methods with retry logic
    const generators = [
      () => this.generateWithFlux(enhancedPrompt, request),
      () => this.generateWithPollinations(enhancedPrompt),
      () => this.generateWithIntelligentUnsplash(enhancedPrompt, request.topic),
      () => this.generateWithPicsum(enhancedPrompt),
    ];

    for (const generator of generators) {
      try {
        const result = await generator();
        if (result.success && result.url) {
          // Test URL validity for external sources
          if (!result.url.startsWith('data:') && result.source !== 'cache') {
            const isValid = await this.testImageUrl(result.url);
            if (!isValid) {
              console.warn(`Image URL failed validation: ${result.source}`);
              continue; // Try next generator
            }
          }
          
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

  // Test if an image URL is actually accessible
  private async testImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 5000 
      } as any);
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  }

  private enhancePrompt(request: ImageGenerationRequest): string {
    let prompt = request.prompt;
    
    // Content filtering for inappropriate topics
    const sensitiveTopics = [
      'jeffrey epstein', 'sexual abuse', 'exploitation', 'violence', 'harassment',
      'illegal activities', 'drugs', 'weapons', 'hate speech', 'discrimination'
    ];
    
    const promptLower = prompt.toLowerCase();
    const hasSensitiveContent = sensitiveTopics.some(topic => promptLower.includes(topic));
    
    if (hasSensitiveContent) {
      // Replace with educational alternative
      prompt = 'Professional educational diagram about legal studies and ethics';
      console.warn('Sensitive content detected, using educational alternative');
    }
    
    // Clean up common instructional text
    prompt = prompt
      .replace(/vibrant and illustrative visual that represents the core idea of:/gi, '')
      .replace(/the style should be educational and visually appealing/gi, '')
      .replace(/like a modern textbook illustration/gi, '')
      .replace(/avoid text in the image/gi, '')
      .replace(/["""]/g, '')
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    // Limit prompt length to prevent URL issues
    if (prompt.length > 200) {
      prompt = prompt.substring(0, 200).trim();
    }

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

  // Use Hugging Face Flux model via Flask backend
  private async generateWithFlux(enhancedPrompt: string, request?: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const result = await this.callFluxBackend(enhancedPrompt, request);
      if (result) {
        return { url: result, source: 'huggingface-flux', success: true };
      }
    } catch (error) {
      console.warn('Hugging Face Flux generation failed:', error);
    }
    
    return { url: '', source: 'flux', success: false };
  }

  // Helper to call Flask backend for Hugging Face Flux
  private async callFluxBackend(prompt: string, request?: ImageGenerationRequest): Promise<string | null> {
    try {
      const dimensions = request?.dimensions || { width: 800, height: 450 };
      const quality = request?.quality || 'high';
      
      // Enhance dimensions based on quality
      if (quality === 'ultra') {
        dimensions.width = Math.min(dimensions.width * 1.5, 1024);
        dimensions.height = Math.min(dimensions.height * 1.5, 1024);
      } else if (quality === 'high') {
        dimensions.width = Math.min(dimensions.width * 1.25, 1024);
        dimensions.height = Math.min(dimensions.height * 1.25, 1024);
      }
      
      const response = await fetch('http://localhost:5000/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          width: Math.round(dimensions.width),
          height: Math.round(dimensions.height),
          quality_mode: quality
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // Handle specific error cases
        if (response.status === 503 && errorData?.error === 'model_loading') {
          console.warn('Hugging Face model is loading, will retry later');
          return null;
        }
        
        console.warn(`Flask backend error: ${response.status}`, errorData);
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.image) {
        return data.image; // Base64 data URL
      }
      
      return null;
    } catch (error) {
      // Backend might not be running, fail silently and use fallback
      console.warn('Flask backend not available:', error);
      return null;
    }
  }

  private async generateWithPollinations(prompt: string): Promise<ImageGenerationResponse> {
    try {
      // Clean and limit prompt for URL safety
      const cleanPrompt = prompt
        .replace(/[^\w\s,.-]/g, '') // Remove special characters that might break URLs
        .replace(/\s+/g, ' ') // Replace multiple spaces
        .trim()
        .substring(0, 150); // Limit length
      
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const seed = Math.floor(Math.random() * 10000);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&seed=${seed}&enhance=true&nologo=true`;
      
      // Test if the URL is valid before returning
      if (url.length > 2000) {
        console.warn('Pollinations URL too long, shortening prompt');
        const shortPrompt = cleanPrompt.substring(0, 50);
        const shortEncodedPrompt = encodeURIComponent(shortPrompt);
        const shortUrl = `https://image.pollinations.ai/prompt/${shortEncodedPrompt}?width=800&height=450&seed=${seed}&enhance=true&nologo=true`;
        return { url: shortUrl, source: 'pollinations', success: true };
      }
      
      return { url, source: 'pollinations', success: true };
    } catch (error) {
      console.warn('Pollinations generation failed:', error);
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