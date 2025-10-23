// Cloudinary-based storage service
// Free tier: 25GB storage, 25GB bandwidth/month, no credit card required

type ProgressCallback = (progress: number) => void;

// Cloudinary configuration from environment variables
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

/**
 * Upload an image file to Cloudinary
 * @param file - The image file to upload
 * @param userId - The user's ID for organizing files
 * @param folder - Subfolder (uploads/processed/generated/analysis)
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Download URL of the uploaded file
 */
export const uploadImage = async (
  file: File,
  userId: string,
  folder: 'uploads' | 'processed' | 'generated' | 'analysis' | 'chat',
  onProgress?: ProgressCallback
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `visora/${userId}/${folder}`);
    formData.append('resource_type', 'image');

    // Upload with progress tracking if callback provided
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        
        xhr.open('POST', CLOUDINARY_UPLOAD_URL);
        xhr.send(formData);
      });
    } else {
      // Simple upload without progress
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Upload a blob (processed image) to Cloudinary
 * @param blob - The blob to upload
 * @param userId - The user's ID
 * @param folder - Subfolder
 * @param fileName - Custom file name
 * @returns Cloudinary URL
 */
export const uploadBlob = async (
  blob: Blob,
  userId: string,
  folder: 'processed' | 'generated',
  fileName: string
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `visora/${userId}/${folder}`);
    formData.append('resource_type', 'image');

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading blob:', error);
    throw new Error('Failed to upload processed image to Cloudinary');
  }
};

/**
 * Convert File to Blob and upload
 */
export const uploadFileAsBlob = async (
  file: File,
  userId: string,
  folder: 'processed' | 'generated',
  customName?: string
): Promise<string> => {
  const blob = new Blob([file], { type: file.type });
  const fileName = customName || file.name;
  return uploadBlob(blob, userId, folder, fileName);
};

/**
 * Delete an image from Cloudinary
 * Note: Deletion requires backend API with signed requests for security
 * For now, we'll mark it as deprecated - images will auto-delete after 30 days on free tier
 * @param imageUrl - Full Cloudinary URL
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  console.warn('Cloudinary deletion requires backend API. Image will auto-expire on free tier.');
  // To implement deletion, you'd need a backend endpoint that uses the Admin API
  // with your API secret to delete images securely
  return Promise.resolve();
};

/**
 * Convert a data URL (base64) to a Blob and upload
 */
export const uploadDataURL = async (
  dataURL: string,
  userId: string,
  folder: 'processed' | 'generated',
  fileName: string
): Promise<string> => {
  try {
    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    return uploadBlob(blob, userId, folder, fileName);
  } catch (error) {
    console.error('Error uploading data URL:', error);
    throw new Error('Failed to upload image from data URL');
  }
};

/**
 * Get file size from Firebase Storage URL (for display purposes)
 */
export const getFileSize = async (imageUrl: string): Promise<number> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

/**
 * Helper to get image dimensions from URL
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
};

export const storageService = {
  uploadImage,
  uploadBlob,
  uploadFileAsBlob,
  uploadDataURL,
  deleteImage,
  getFileSize,
  getImageDimensions
};

export default storageService;
