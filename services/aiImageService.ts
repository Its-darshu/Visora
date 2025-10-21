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
    // Prioritize Unsplash for people/person prompts to get real photos
    const promptLower = enhancedPrompt.toLowerCase();
    const isPeopleFocused = promptLower.includes('person') || 
                           promptLower.includes('people') || 
                           promptLower.includes('portrait') ||
                           promptLower.includes('elon') ||
                           promptLower.includes('musk') ||
                           promptLower.includes('man') ||
                           promptLower.includes('woman') ||
                           promptLower.includes('ceo') ||
                           promptLower.includes('business person');
    
    const generators = isPeopleFocused ? [
      () => this.generateWithIntelligentUnsplash(enhancedPrompt, request.topic),
      () => this.generateWithPollinations(enhancedPrompt),
      () => this.generateWithFlux(enhancedPrompt, request),
      () => this.generateWithPicsum(enhancedPrompt),
    ] : [
      () => this.generateWithPollinations(enhancedPrompt),
      () => this.generateWithIntelligentUnsplash(enhancedPrompt, request.topic),
      () => this.generateWithFlux(enhancedPrompt, request),
      () => this.generateWithPicsum(enhancedPrompt),
    ];

    // Try all generators in parallel for faster results
    const results = await Promise.allSettled(generators.map(gen => gen()));
    
    // Find first successful result
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success && result.value.url) {
        const imageResult = result.value;
        
        // Cache successful result
        this.cache.set(cacheKey, imageResult.url);
        return {
          ...imageResult,
          metadata: {
            actualPrompt: enhancedPrompt,
            processingTime: Date.now() - startTime
          }
        };
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
        // Backend error - silently fall back to next method
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.image) {
        return data.image; // Base64 data URL
      }
      
      return null;
    } catch (error) {
      // Backend not available - silently fall back to Pollinations
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
        .substring(0, 80); // Keep it shorter for reliability
      
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      const seed = Math.floor(Math.random() * 10000);
      
      // Pollinations URL format - simpler is better
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;
      
      // Return immediately - Pollinations generates on-demand
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
      
      // People & Portraits
      'person': ['1507003211169-0a1dd7884af1', '1438761681033-6461ffad8d80', '1500648767791-00dcc994a43e'],
      'portrait': ['1438761681033-6461ffad8d80', '1500648767791-00dcc994a43e', '1507003211169-0a1dd7884af1'],
      'people': ['1529156069898-49953e39b3ac', '1511632765486-a01980e01a18', '1522202176988-66273c2fd55f'],
      
      // Business & Work
      'business': ['1454165804606-c3d57bc86b40', '1507679799987-c73779587ccf', '1486406146357-2295e8ddf4f3'],
      'office': ['1497366811353-6870744d04b2', '1497366216548-37526070297c', '1486312338219-ce68d2c6f44d'],
      
      // Vehicles & Transportation
      'car': ['1449965962091-9c36df4f2095', '1492144534655-ae79c964c9d7', '1486496572940-2bb2341fdbdf'],
      'bmw': ['1449965962091-9c36df4f2095', '1492144534655-ae79c964c9d7', '1486496572940-2bb2341fdbdf'],
      'vehicle': ['1449965962091-9c36df4f2095', '1494608536218-eb1789a4c01b', '1485291571150-772bcfc10da5'],
      'transport': ['1485291571150-772bcfc10da5', '1494608536218-eb1789a4c01b', '1449965962091-9c36df4f2095'],
      
      // Art & Creative
      'art': ['1460661419201-fd4cecdf8a8b', '1547826039-bfc35e0f1ea8', '1513364776144-60967dc4d60d'],
      'creative': ['1513364776144-60967dc4d60d', '1561214115-f2f1796d6d0f', '1547826039-bfc35e0f1ea8'],
      'design': ['1561214115-f2f1796d6d0f', '1558618666-d1dfe2c95d02', '1527576539890-dfa815ec81b8'],
      
      // Architecture & City
      'architecture': ['1486718448742-163732cd1544', '1511818966892-d7d671e672a2', '1518005068023-37cce913c938'],
      'city': ['1480714378408-67cf0d13bc1b', '1449824913935-59a10b8d2000', '1477959858617-67f85cf4f1df'],
      'urban': ['1477959858617-67f85cf4f1df', '1449824913935-59a10b8d2000', '1480714378408-67cf0d13bc1b'],
    };

    // Find best matching collection
    const promptLower = prompt.toLowerCase();
    let selectedPhoto = null;

    // First try exact topic match
    if (topic && topicCollections[topic.toLowerCase()]) {
      const photos = topicCollections[topic.toLowerCase()];
      selectedPhoto = photos[Math.floor(Math.random() * photos.length)];
    } else {
      // Try keyword matching with priority
      const keywords = ['car', 'bmw', 'vehicle', 'person', 'people', 'portrait', 'business', 'technology', 'art', 'creative', 'city', 'nature', 'space'];
      
      for (const keyword of keywords) {
        if (promptLower.includes(keyword) && topicCollections[keyword]) {
          selectedPhoto = topicCollections[keyword][Math.floor(Math.random() * topicCollections[keyword].length)];
          break;
        }
      }
      
      // If no keyword match, try all topics
      if (!selectedPhoto) {
        for (const [topicKey, photos] of Object.entries(topicCollections)) {
          if (promptLower.includes(topicKey)) {
            selectedPhoto = photos[Math.floor(Math.random() * photos.length)];
            break;
          }
        }
      }
    }

    if (selectedPhoto) {
      const url = `https://images.unsplash.com/photo-${selectedPhoto}?w=1200&h=800&fit=crop&crop=center&q=80`;
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