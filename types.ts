
/// <reference types="vite/client" />

export interface LessonConcept {
  concept: string;
  explanation: string;
}

export interface Lesson {
  title: string;
  introduction: string;
  keyConcepts: LessonConcept[];
  summary: string;
}

// Environment variables interface
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_KEY: string
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
