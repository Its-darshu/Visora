import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAXuJyxMprEVLKycfLxwuZ3VbGe-0e6Zeg",
  authDomain: "aitutor-d6.firebaseapp.com",
  projectId: "aitutor-d6",
  storageBucket: "aitutor-d6.firebasestorage.app",
  messagingSenderId: "1075043719698",
  appId: "1:1075043719698:web:000d85f21046dc2c8996cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;