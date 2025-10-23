import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface ImageHistoryItem {
  id?: string;
  userId: string;
  type: 'upscale' | 'background-remove' | 'enhance' | 'filter' | 'crop' | 'transform';
  originalImageUrl: string;
  processedImageUrl: string;
  settings: Record<string, any>;
  createdAt: Timestamp;
  fileSize: number;
  dimensions: { width: number; height: number };
}

export interface GeneratedImage {
  id?: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  style: string;
  quality: string;
  createdAt: Timestamp;
}

export interface ChatSession {
  id?: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
    timestamp: Timestamp;
  }>;
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
}

export interface VisualAnalysis {
  id?: string;
  userId: string;
  imageUrl: string;
  extractedText: string;
  aiAnalysis: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  subscription: 'free' | 'pro';
  apiUsage: {
    imagesGenerated: number;
    imagesProcessed: number;
    chatMessages: number;
  };
}

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  IMAGE_HISTORY: 'imageHistory',
  GENERATED_IMAGES: 'generatedImages',
  CHAT_HISTORY: 'chatHistory',
  VISUAL_ANALYSIS: 'visualAnalysis'
};

// ==================== IMAGE HISTORY ====================

export const saveImageHistory = async (data: Omit<ImageHistoryItem, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.IMAGE_HISTORY), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving image history:', error);
    throw error;
  }
};

export const getImageHistory = async (userId: string, limitCount: number = 50): Promise<ImageHistoryItem[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.IMAGE_HISTORY),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ImageHistoryItem));
  } catch (error) {
    console.error('Error getting image history:', error);
    throw error;
  }
};

export const getImageHistoryByType = async (
  userId: string, 
  type: ImageHistoryItem['type'],
  limitCount: number = 50
): Promise<ImageHistoryItem[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.IMAGE_HISTORY),
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ImageHistoryItem));
  } catch (error) {
    console.error('Error getting image history by type:', error);
    throw error;
  }
};

export const deleteImageHistory = async (historyId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.IMAGE_HISTORY, historyId));
  } catch (error) {
    console.error('Error deleting image history:', error);
    throw error;
  }
};

// ==================== GENERATED IMAGES ====================

export const saveGeneratedImage = async (data: Omit<GeneratedImage, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.GENERATED_IMAGES), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving generated image:', error);
    throw error;
  }
};

export const getGeneratedImages = async (userId: string, limitCount: number = 50): Promise<GeneratedImage[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.GENERATED_IMAGES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GeneratedImage));
  } catch (error) {
    console.error('Error getting generated images:', error);
    throw error;
  }
};

// ==================== CHAT HISTORY ====================

export const saveChatSession = async (data: Omit<ChatSession, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHAT_HISTORY), data);
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat session:', error);
    throw error;
  }
};

export const updateChatSession = async (sessionId: string, messages: ChatSession['messages']): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.CHAT_HISTORY, sessionId), {
      messages,
      lastMessageAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
};

export const getChatHistory = async (userId: string, limitCount: number = 20): Promise<ChatSession[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CHAT_HISTORY),
      where('userId', '==', userId),
      orderBy('lastMessageAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatSession));
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

export const getChatSession = async (sessionId: string): Promise<ChatSession | null> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.CHAT_HISTORY, sessionId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ChatSession;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    throw error;
  }
};

// ==================== VISUAL ANALYSIS ====================

export const saveVisualAnalysis = async (data: Omit<VisualAnalysis, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.VISUAL_ANALYSIS), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving visual analysis:', error);
    throw error;
  }
};

export const getVisualAnalysisHistory = async (userId: string, limitCount: number = 50): Promise<VisualAnalysis[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.VISUAL_ANALYSIS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VisualAnalysis));
  } catch (error) {
    console.error('Error getting visual analysis history:', error);
    throw error;
  }
};

// ==================== USER PROFILE ====================

export const createUserProfile = async (userId: string, data: Omit<UserProfile, 'createdAt' | 'apiUsage'>): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...data,
      createdAt: serverTimestamp(),
      apiUsage: {
        imagesGenerated: 0,
        imagesProcessed: 0,
        chatMessages: 0
      }
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserApiUsage = async (
  userId: string, 
  field: 'imagesGenerated' | 'imagesProcessed' | 'chatMessages'
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      const currentUsage = userDoc.data().apiUsage || {};
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        [`apiUsage.${field}`]: (currentUsage[field] || 0) + 1
      });
    }
  } catch (error) {
    console.error('Error updating API usage:', error);
    throw error;
  }
};

export const firestoreService = {
  // Image History
  saveImageHistory,
  getImageHistory,
  getImageHistoryByType,
  deleteImageHistory,
  
  // Generated Images
  saveGeneratedImage,
  getGeneratedImages,
  
  // Chat History
  saveChatSession,
  updateChatSession,
  getChatHistory,
  getChatSession,
  
  // Visual Analysis
  saveVisualAnalysis,
  getVisualAnalysisHistory,
  
  // User Profile
  createUserProfile,
  getUserProfile,
  updateUserApiUsage
};

export default firestoreService;
