import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { FirebaseConfig, PokeEvent } from '../types';

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
 * Send real-time love touch event to Firebase Firestore
 */
export async function sendRealtimeLoveTouch(event: PokeEvent): Promise<void> {
  if (!firestoreDb) return;
  try {
    const touchDoc = doc(firestoreDb, 'couple_hub', 'love_touch');
    await setDoc(touchDoc, {
      ...event,
      sentAt: Date.now()
    });
  } catch (err) {
    console.warn('Love touch send error:', err);
  }
}

/**
 * Listen for incoming real-time love touches from partner
 */
export function listenToLoveTouch(onReceived: (event: PokeEvent) => void): () => void {
  if (!firestoreDb) return () => {};
  try {
    const touchDoc = doc(firestoreDb, 'couple_hub', 'love_touch');
    const unsubscribe = onSnapshot(touchDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as PokeEvent & { sentAt: number };
        // Only trigger if sent within the last 15 seconds
        if (data && data.sentAt && Date.now() - data.sentAt < 15000) {
          onReceived(data);
        }
      }
    });
    return unsubscribe;
  } catch (err) {
    console.warn('Love touch listener error:', err);
    return () => {};
  }
}

/**
 * Optimizes and compresses photos into lightweight WebP Data URIs (~25-45KB)
 * Guaranteed to resolve safely and never hang.
 */
export async function uploadMedia(file: File): Promise<string> {
  return new Promise((resolve) => {
    // 8-second safety fallback
    const timeout = setTimeout(() => {
      const fallbackUrl = URL.createObjectURL(file);
      resolve(fallbackUrl);
    }, 8000);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        clearTimeout(timeout);
        resolve(URL.createObjectURL(file));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 750;
          const MAX_HEIGHT = 750;
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
            const dataUrl = canvas.toDataURL('image/webp', 0.65);
            clearTimeout(timeout);
            resolve(dataUrl);
          } else {
            clearTimeout(timeout);
            resolve(result);
          }
        } catch (e) {
          clearTimeout(timeout);
          resolve(result);
        }
      };
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(result);
      };
      img.src = result;
    };
    reader.onerror = () => {
      clearTimeout(timeout);
      resolve(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  });
}
