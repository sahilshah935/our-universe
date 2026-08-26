import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseConfig } from '../types';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyCjb1EMc9IIJ7AKzOQB3fiZf-seXKiO_jc",
  authDomain: "ouruniverse-ebf07.firebaseapp.com",
  projectId: "ouruniverse-ebf07",
  storageBucket: "ouruniverse-ebf07.firebasestorage.app",
  messagingSenderId: "505347171933",
  appId: "1:505347171933:web:b61253fa45fe6d26614fb4"
};

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function getStoredFirebaseConfig(): FirebaseConfig {
  try {
    const saved = localStorage.getItem('asmi_firebase_config_v1');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem('asmi_firebase_config_v1', JSON.stringify(config));
  initializeFirebase(config);
}

export function initializeFirebase(config?: FirebaseConfig): {
  app: FirebaseApp | null;
  db: Firestore | null;
} {
  const activeConfig = config || getStoredFirebaseConfig();

  try {
    if (activeConfig.apiKey && activeConfig.projectId) {
      if (getApps().length > 0) {
        firebaseApp = getApps()[0];
      } else {
        firebaseApp = initializeApp(activeConfig);
      }
      firestoreDb = getFirestore(firebaseApp);
      console.log('✨ Firebase Cloud Firestore connected successfully for Our Universe!');
    }
  } catch (err) {
    console.warn('Firebase initialization note:', err);
  }

  return { app: firebaseApp, db: firestoreDb };
}

// Auto-initialize with default project credentials
initializeFirebase();

export { firebaseApp, firestoreDb };

export function isFirebaseConnected(): boolean {
  return firestoreDb !== null;
}

/**
 * Optimizes and compresses photos into high-efficiency WebP Data URIs
 * for instant, 100% free Google Cloud storage.
 */
export async function uploadMedia(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.82);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
