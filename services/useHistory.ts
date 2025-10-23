import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, ImageHistoryItem } from './firestoreService';
import { storageService } from './storageService';

/**
 * Custom hook to manage image history with Firebase
 */
export const useImageHistory = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history when component mounts
  useEffect(() => {
    if (currentUser) {
      loadHistory();
    }
  }, [currentUser]);

  const loadHistory = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await firestoreService.getImageHistory(currentUser.uid, 50);
      setHistory(data);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save a processed image to history
   */
  const saveToHistory = async (
    originalFile: File,
    processedBlob: Blob,
    type: ImageHistoryItem['type'],
    settings: Record<string, any>
  ): Promise<void> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // 1. Upload original image
      const originalUrl = await storageService.uploadImage(
        originalFile,
        currentUser.uid,
        'uploads'
      );

      // 2. Upload processed image
      const processedUrl = await storageService.uploadBlob(
        processedBlob,
        currentUser.uid,
        'processed',
        `${type}_${originalFile.name}`
      );

      // 3. Get dimensions
      const dimensions = await storageService.getImageDimensions(originalFile);

      // 4. Save to Firestore
      await firestoreService.saveImageHistory({
        userId: currentUser.uid,
        type,
        originalImageUrl: originalUrl,
        processedImageUrl: processedUrl,
        settings,
        fileSize: originalFile.size,
        dimensions
      });

      // 5. Update API usage
      await firestoreService.updateUserApiUsage(currentUser.uid, 'imagesProcessed');

      // 6. Reload history
      await loadHistory();
    } catch (err) {
      console.error('Error saving to history:', err);
      throw err;
    }
  };

  /**
   * Delete a history item
   */
  const deleteHistoryItem = async (historyId: string, imageUrl: string) => {
    try {
      // Delete from storage
      await storageService.deleteImage(imageUrl);
      
      // Delete from Firestore
      await firestoreService.deleteImageHistory(historyId);
      
      // Reload history
      await loadHistory();
    } catch (err) {
      console.error('Error deleting history item:', err);
      throw err;
    }
  };

  return {
    history,
    loading,
    error,
    loadHistory,
    saveToHistory,
    deleteHistoryItem
  };
};

/**
 * Custom hook for chat history
 */
export const useChatHistory = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadSessions();
    }
  }, [currentUser]);

  const loadSessions = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const data = await firestoreService.getChatHistory(currentUser.uid, 20);
      setSessions(data);
    } catch (err) {
      console.error('Error loading chat sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    sessions,
    loading,
    loadSessions
  };
};

export default { useImageHistory, useChatHistory };
