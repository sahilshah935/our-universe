import { saveMediaItem } from './imageDb';
import { isCloudinaryConfigured, uploadImageToCloudinary } from './cloudinary';
import { isR2Configured, uploadImageToR2 } from './r2Storage';

/**
 * Universal Permanent Public Cloud Image Storage for Our Universe
 * 1. Prioritizes Cloudinary if configured.
 * 2. Tries Cloudflare R2 if configured.
 * 3. Primary Auto Public Cloud: Catbox.moe (Free, permanent, zero-config public HTTPS).
 * 4. Fallback to compressed WebP local cache if offline.
 */
export async function uploadImage(file: File): Promise<string> {
  // 1. Try Cloudinary if configured
  if (isCloudinaryConfigured()) {
    try {
      const cldUrl = await uploadImageToCloudinary(file);
      if (cldUrl && cldUrl.startsWith('http')) {
        return cldUrl;
      }
    } catch (err) {
      console.warn('Cloudinary upload error, falling back:', err);
    }
  }

  // 2. Try Cloudflare R2 if configured
  if (isR2Configured()) {
    try {
      const r2Url = await uploadImageToR2(file);
      if (r2Url && r2Url.startsWith('http')) {
        return r2Url;
      }
    } catch (err) {
      console.warn('Cloudflare R2 upload error, falling back:', err);
    }
  }

  // 3. Primary Auto Public Cloud: Catbox.moe (Public, permanent, fast HTTPS CDN)
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const publicUrl = (await res.text()).trim();
      if (publicUrl && publicUrl.startsWith('http')) {
        console.log('✨ Image successfully uploaded to public cloud:', publicUrl);
        const mediaId = 'img_' + Date.now();
        await saveMediaItem(mediaId, publicUrl);
        return publicUrl;
      }
    }
  } catch (err) {
    console.warn('Catbox cloud upload error, trying secondary:', err);
  }

  // 4. Secondary Auto Public Cloud: tmpfiles.org
  try {
    const formData = new FormData();
    formData.append('input_file', file);
    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.url) {
        // Convert tmpfiles.org/xxx to tmpfiles.org/dl/xxx for direct image embed
        const directUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        console.log('✨ Image uploaded to secondary cloud:', directUrl);
        return directUrl;
      }
    }
  } catch (e) {
    console.warn('Secondary cloud upload error:', e);
  }

  // 5. Offline fallback: local WebP
  const localDataUrl = await compressToDataUrl(file);
  const mediaId = 'img_' + Date.now();
  await saveMediaItem(mediaId, localDataUrl);
  return localDataUrl;
}

function compressToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        resolve(URL.createObjectURL(file));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/webp', 0.7));
          } else {
            resolve(result);
          }
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}
