import { saveMediaItem } from './imageDb';

export const DEFAULT_GOOGLE_DRIVE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyR4x3m-4sXcv7PAA6QOKi3Qpsx5-vhbNvtuvqiiMA9eq4CjzMEJtD3rSpq0vFHfgrRxA/exec';

const DRIVE_SCRIPT_KEY = 'asmi_google_drive_script_url_v1';

export function getGoogleDriveScriptUrl(): string {
  try {
    const saved = localStorage.getItem(DRIVE_SCRIPT_KEY);
    if (saved) return saved;
  } catch (e) {}
  return DEFAULT_GOOGLE_DRIVE_SCRIPT_URL;
}

export function saveGoogleDriveScriptUrl(url: string): void {
  localStorage.setItem(DRIVE_SCRIPT_KEY, url.trim());
}

export function isGoogleDriveConfigured(): boolean {
  return Boolean(getGoogleDriveScriptUrl());
}

/**
 * Upload an image file directly to the user's personal Google Drive folder
 * Returns a high-speed direct viewable image link (https://lh3.googleusercontent.com/d/FILE_ID)
 */
export async function uploadImageToGoogleDrive(file: File): Promise<string> {
  const scriptUrl = getGoogleDriveScriptUrl();
  if (!scriptUrl) {
    throw new Error('Google Drive script URL is not configured');
  }

  // Convert File to base64
  const base64Data = await fileToBase64(file);
  const fileName = `couple_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const payload = {
    base64: base64Data,
    fileName: fileName,
    mimeType: file.type || 'image/jpeg'
  };

  const response = await fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Google Drive script responded with HTTP status ${response.status}`);
  }

  const result = await response.json();
  if (result.status === 'success' && result.url) {
    // Cache in local IndexedDB for instant offline load
    const mediaId = 'gdrive_' + (result.fileId || Date.now());
    await saveMediaItem(mediaId, result.url);
    console.log('✅ Image uploaded directly to Google Drive folder:', result.url);
    return result.url;
  }

  throw new Error(result.message || 'Failed to upload image to Google Drive');
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      resolve(res);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
