import { saveMediaItem } from './imageDb';

/**
 * Universal Permanent Image Storage for Our Universe
 * 1. Compresses photo into clean WebP.
 * 2. Saves to browser IndexedDB (500MB+ storage capacity) so it never disappears on refresh.
 * 3. Attempts to upload to free cloud hosting (ImgBB) for multi-device sync without any paid plan.
 */
export async function uploadImage(file: File): Promise<string> {
  const localDataUrl = await compressToDataUrl(file);
  const mediaId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

  // Always save locally to IndexedDB first
  await saveMediaItem(mediaId, localDataUrl);

  // Try cloud upload (free ImgBB service)
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Free couple media upload key
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
