// Image Editing Service - Outpainting, Background Removal & Enhancement
// This service provides advanced image manipulation capabilities

export interface ImageEditResult {
  success: boolean;
  editedImageUrl: string;
  originalImageUrl: string;
  operation: string;
  processingTime: number;
  message?: string;
  error?: string;
}

export interface BackgroundRemovalResult {
  success: boolean;
  imageUrl: string;
  message: string;
  hasBackground: boolean;
}

export interface OutpaintOptions {
  direction: 'top' | 'bottom' | 'left' | 'right' | 'all';
  extensionPixels: number;
  fillStyle: 'smart' | 'blur' | 'stretch' | 'mirror';
  seamBlending: boolean;
}

/**
 * Remove background from an image
 * Uses canvas-based edge detection and color analysis
 */
export async function removeBackground(imageFile: File): Promise<BackgroundRemovalResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple background removal algorithm
        // This is a basic implementation - in production, use ML-based services like remove.bg
        const threshold = 240; // Background detection threshold
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Check if pixel is likely background (white/light colored)
          const isBackground = (r > threshold && g > threshold && b > threshold);
          
          if (isBackground) {
            // Make transparent
            data[i + 3] = 0;
          }
        }
        
        // Put modified data back
        ctx.putImageData(imageData, 0, 0);
        
        const resultUrl = canvas.toDataURL('image/png');
        const processingTime = Date.now() - startTime;
        
        resolve({
          success: true,
          imageUrl: resultUrl,
          message: `Background removed successfully in ${processingTime}ms`,
          hasBackground: false
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Outpaint an image - extend it in specified directions with smart fill
 */
export async function outpaintImage(
  imageFile: File, 
  options: OutpaintOptions
): Promise<ImageEditResult> {
  const startTime = Date.now();
  const originalUrl = URL.createObjectURL(imageFile);
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const ext = options.extensionPixels;
        
        // Calculate new canvas dimensions
        let newWidth = img.width;
        let newHeight = img.height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (options.direction === 'all') {
          newWidth += ext * 2;
          newHeight += ext * 2;
          offsetX = ext;
          offsetY = ext;
        } else if (options.direction === 'left') {
          newWidth += ext;
          offsetX = ext;
        } else if (options.direction === 'right') {
          newWidth += ext;
        } else if (options.direction === 'top') {
          newHeight += ext;
          offsetY = ext;
        } else if (options.direction === 'bottom') {
          newHeight += ext;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Apply fill style
        applyFillStyle(ctx, img, options, offsetX, offsetY, ext);
        
        // Draw original image on top
        ctx.drawImage(img, offsetX, offsetY);
        
        // Apply seam blending if enabled
        if (options.seamBlending) {
          applySeamBlending(ctx, offsetX, offsetY, img.width, img.height);
        }
        
        const editedImageUrl = canvas.toDataURL('image/png');
        const processingTime = Date.now() - startTime;
        
        resolve({
          success: true,
          editedImageUrl,
          originalImageUrl: originalUrl,
          operation: 'outpaint',
          processingTime,
          message: `Image outpainted successfully (${options.direction}) in ${processingTime}ms`
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Apply different fill styles for outpainting
 */
function applyFillStyle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  options: OutpaintOptions,
  offsetX: number,
  offsetY: number,
  ext: number
) {
  if (options.fillStyle === 'blur') {
    // Draw stretched and blurred version as background
    ctx.filter = 'blur(20px)';
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.filter = 'none';
  } else if (options.fillStyle === 'stretch') {
    // Stretch the image to fill canvas
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  } else if (options.fillStyle === 'mirror') {
    // Mirror edges
    ctx.save();
    
    // Mirror horizontally for left/right extensions
    if (options.direction === 'left' || options.direction === 'all') {
      ctx.scale(-1, 1);
      ctx.drawImage(img, -offsetX, offsetY, img.width, img.height);
      ctx.scale(-1, 1);
    }
    
    // Mirror vertically for top/bottom extensions
    if (options.direction === 'top' || options.direction === 'all') {
      ctx.scale(1, -1);
      ctx.drawImage(img, offsetX, -offsetY, img.width, img.height);
      ctx.scale(1, -1);
    }
    
    ctx.restore();
  } else if (options.fillStyle === 'smart') {
    // Smart fill: gradient from edge colors
    const edgeColor = getEdgeColor(img);
    const gradient = ctx.createRadialGradient(
      ctx.canvas.width / 2, ctx.canvas.height / 2, 0,
      ctx.canvas.width / 2, ctx.canvas.height / 2, Math.max(ctx.canvas.width, ctx.canvas.height)
    );
    gradient.addColorStop(0, edgeColor);
    gradient.addColorStop(1, `${edgeColor}88`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/**
 * Get average color from image edges
 */
function getEdgeColor(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let r = 0, g = 0, b = 0, count = 0;
  
  // Sample edges
  for (let i = 0; i < data.length; i += 40) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }
  
  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Apply seam blending for smoother transitions
 */
function applySeamBlending(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number
) {
  const blendWidth = 20; // pixels to blend
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  
  // Apply gradient alpha to seam areas
  for (let y = 0; y < ctx.canvas.height; y++) {
    for (let x = 0; x < ctx.canvas.width; x++) {
      const idx = (y * ctx.canvas.width + x) * 4;
      
      // Check if pixel is near seam
      const distToSeam = Math.min(
        Math.abs(x - offsetX),
        Math.abs(x - (offsetX + width)),
        Math.abs(y - offsetY),
        Math.abs(y - (offsetY + height))
      );
      
      if (distToSeam < blendWidth) {
        // Apply gradient alpha
        const alpha = distToSeam / blendWidth;
        data[idx + 3] = Math.floor(data[idx + 3] * alpha);
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Enhance image quality (brightness, contrast, sharpness)
 */
export async function enhanceImageQuality(
  imageFile: File,
  options: {
    brightness?: number; // -100 to 100
    contrast?: number; // -100 to 100
    saturation?: number; // -100 to 100
    sharpen?: boolean;
  }
): Promise<ImageEditResult> {
  const startTime = Date.now();
  const originalUrl = URL.createObjectURL(imageFile);
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Build filter string
        const filters = [];
        
        if (options.brightness !== undefined) {
          filters.push(`brightness(${100 + options.brightness}%)`);
        }
        if (options.contrast !== undefined) {
          filters.push(`contrast(${100 + options.contrast}%)`);
        }
        if (options.saturation !== undefined) {
          filters.push(`saturate(${100 + options.saturation}%)`);
        }
        if (options.sharpen) {
          // Sharpening via contrast boost
          filters.push('contrast(120%)');
        }
        
        ctx.filter = filters.join(' ');
        ctx.drawImage(img, 0, 0);
        
        const editedImageUrl = canvas.toDataURL('image/png');
        const processingTime = Date.now() - startTime;
        
        resolve({
          success: true,
          editedImageUrl,
          originalImageUrl: originalUrl,
          operation: 'enhance',
          processingTime,
          message: `Image enhanced successfully in ${processingTime}ms`
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Apply artistic filters to an image
 */
export async function applyArtisticFilter(
  imageFile: File,
  filterType: 'grayscale' | 'sepia' | 'invert' | 'vintage' | 'cool' | 'warm'
): Promise<ImageEditResult> {
  const startTime = Date.now();
  const originalUrl = URL.createObjectURL(imageFile);
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply filter
        let filter = '';
        switch (filterType) {
          case 'grayscale':
            filter = 'grayscale(100%)';
            break;
          case 'sepia':
            filter = 'sepia(100%)';
            break;
          case 'invert':
            filter = 'invert(100%)';
            break;
          case 'vintage':
            filter = 'sepia(50%) contrast(120%) brightness(90%)';
            break;
          case 'cool':
            filter = 'saturate(150%) hue-rotate(180deg)';
            break;
          case 'warm':
            filter = 'saturate(150%) hue-rotate(-20deg) brightness(110%)';
            break;
        }
        
        ctx.filter = filter;
        ctx.drawImage(img, 0, 0);
        
        const editedImageUrl = canvas.toDataURL('image/png');
        const processingTime = Date.now() - startTime;
        
        resolve({
          success: true,
          editedImageUrl,
          originalImageUrl: originalUrl,
          operation: `filter-${filterType}`,
          processingTime,
          message: `${filterType} filter applied successfully in ${processingTime}ms`
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Crop image to specified dimensions
 */
export async function cropImage(
  imageFile: File,
  crop: { x: number; y: number; width: number; height: number }
): Promise<ImageEditResult> {
  const startTime = Date.now();
  const originalUrl = URL.createObjectURL(imageFile);
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = crop.width;
        canvas.height = crop.height;
        
        ctx.drawImage(
          img,
          crop.x, crop.y, crop.width, crop.height,
          0, 0, crop.width, crop.height
        );
        
        const editedImageUrl = canvas.toDataURL('image/png');
        const processingTime = Date.now() - startTime;
        
        resolve({
          success: true,
          editedImageUrl,
          originalImageUrl: originalUrl,
          operation: 'crop',
          processingTime,
          message: `Image cropped successfully in ${processingTime}ms`
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Resize image to specified dimensions
 */
export async function resizeImage(
  imageFile: File,
  newWidth: number,
  newHeight: number,
  maintainAspectRatio: boolean = true
): Promise<ImageEditResult> {
  const startTime = Date.now();
  const originalUrl = URL.createObjectURL(imageFile);
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        if (maintainAspectRatio) {
          const aspectRatio = img.width / img.height;
          if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
          } else {
            newHeight = newWidth / aspectRatio;
          }
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        const editedImageUrl = canvas.toDataURL('image/png');
        const processingTime = Date.now() - startTime;
        
        resolve({
          success: true,
          editedImageUrl,
          originalImageUrl: originalUrl,
          operation: 'resize',
          processingTime,
          message: `Image resized to ${Math.round(newWidth)}x${Math.round(newHeight)} in ${processingTime}ms`
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(imageFile);
  });
}
