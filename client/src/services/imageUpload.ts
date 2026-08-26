import { saveMediaItem } from './imageDb';
import { isR2Configured, uploadImageToR2 } from './r2Storage';

/**
 * Universal Permanent Image Storage for Our Universe
 * 1. If Cloudflare R2 is configured, uploads directly to your Cloudflare R2 bucket.
 * 2. Otherwise uploads to ImgBB Free Cloud and backs up to browser IndexedDB (500MB+).
 */
export async function uploadImage(file: File): Promise<string> {
  // 1. Try Cloudflare R2 first if configured
  if (isR2Configured()) {
    try {
      const r2Url = await uploadImageToR2(file);
      if (r2Url) {
        return r2Url;
      }
    } catch (err) {
      console.warn('Cloudflare R2 upload attempt error, falling back:', err);
    }
  }

  // 2. Local WebP compression & IndexedDB backup
  const localDataUrl = await compressToDataUrl(file);
  const mediaId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  await saveMediaItem(mediaId, localDataUrl);

  // 3. Try free cloud hosting
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch('https://api.imgbb.com/1/upload?key=6d207e02198a847aa5a0a0330f4029c2', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.data && data.data.url) {
        return data.data.url;
      }
    }
  } catch (err) {
    console.warn('Cloud image upload fallback to local IndexedDB:', err);
  }

  return localDataUrl;
}

function compressToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
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
          const MAX_WIDTH = 900;
          const MAX_HEIGHT = 900;
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
            const webp = canvas.toDataURL('image/webp', 0.72);
            clearTimeout(timeout);
            resolve(webp);
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
