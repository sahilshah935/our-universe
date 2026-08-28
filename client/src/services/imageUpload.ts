import { saveMediaItem } from './imageDb';
import { isCloudinaryConfigured, uploadImageToCloudinary } from './cloudinary';
import { isR2Configured, uploadImageToR2 } from './r2Storage';

/**
 * Universal Image Optimizer & Cloud Uploader for Our Universe
 * 1. If Cloudinary or Cloudflare R2 is configured, uploads to dedicated cloud.
 * 2. Otherwise creates an ultra-optimized, high-clarity WebP image (~30KB)
 *    that syncs natively and seamlessly through Firebase Cloud Firestore with zero CORS issues.
 */
export async function uploadImage(file: File): Promise<string> {
  // 1. Try Cloudinary if user configured it
  if (isCloudinaryConfigured()) {
    try {
      const cldUrl = await uploadImageToCloudinary(file);
      if (cldUrl && cldUrl.startsWith('http')) {
        return cldUrl;
      }
    } catch (err) {
      console.warn('Cloudinary upload attempt note:', err);
    }
  }

  // 2. Try Cloudflare R2 if user configured it
  if (isR2Configured()) {
    try {
      const r2Url = await uploadImageToR2(file);
      if (r2Url && r2Url.startsWith('http')) {
        return r2Url;
      }
    } catch (err) {
      console.warn('Cloudflare R2 upload attempt note:', err);
    }
  }

  // 3. Ultra-optimized WebP Data URL (~25KB-45KB) for seamless real-time Firebase Sync
  const optimizedDataUrl = await compressToLightweightWebP(file);
  const mediaId = 'img_' + Date.now();
  await saveMediaItem(mediaId, optimizedDataUrl);
  return optimizedDataUrl;
}

function compressToLightweightWebP(file: File): Promise<string> {
  return new Promise((resolve) => {
    // 6-second fallback
    const timeout = setTimeout(() => {
      resolve(URL.createObjectURL(file));
    }, 6000);

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
          const MAX_SIZE = 700;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // 0.68 quality WebP gives crisp retina visual quality with tiny ~30KB footprint
            const webp = canvas.toDataURL('image/webp', 0.68);
            clearTimeout(timeout);
            resolve(webp);
          } else {
            clearTimeout(timeout);
            resolve(result);
          }
        } catch {
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
