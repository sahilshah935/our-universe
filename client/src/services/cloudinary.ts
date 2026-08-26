import { saveMediaItem } from './imageDb';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

const CLOUDINARY_CONFIG_KEY = 'asmi_cloudinary_config_v1';

// Default / fallback preset if user has not set custom
const DEFAULT_CLOUDINARY_CONFIG: CloudinaryConfig = {
  cloudName: '',
  uploadPreset: ''
};

export function getCloudinaryConfig(): CloudinaryConfig {
  try {
    const raw = localStorage.getItem(CLOUDINARY_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return DEFAULT_CLOUDINARY_CONFIG;
}

export function saveCloudinaryConfig(config: CloudinaryConfig): void {
  localStorage.setItem(CLOUDINARY_CONFIG_KEY, JSON.stringify(config));
}

export function isCloudinaryConfigured(): boolean {
  const cfg = getCloudinaryConfig();
  return Boolean(cfg.cloudName && cfg.uploadPreset);
}

/**
 * Upload image directly to Cloudinary using unsigned upload preset
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cfg = getCloudinaryConfig();
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured yet');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cfg.uploadPreset.trim());

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cfg.cloudName.trim()}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Cloudinary upload failed with status ${response.status}`);
  }

  const data = await response.json();
  const secureUrl = data.secure_url || data.url;

  if (secureUrl) {
    // Cache in local IndexedDB as backup
    const mediaId = 'cld_' + Date.now();
    await saveMediaItem(mediaId, secureUrl);
    return secureUrl;
  }

  throw new Error('No secure URL returned by Cloudinary');
}
