import { saveMediaItem } from './imageDb';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string; // e.g. https://pub-xxxx.r2.dev or custom CDN
}

const R2_CONFIG_KEY = 'asmi_cloudflare_r2_config_v1';

export function getR2Config(): R2Config | null {
  try {
    const raw = localStorage.getItem(R2_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export function saveR2Config(config: R2Config): void {
  localStorage.setItem(R2_CONFIG_KEY, JSON.stringify(config));
}

export function isR2Configured(): boolean {
  const cfg = getR2Config();
  return Boolean(cfg && cfg.accountId && cfg.accessKeyId && cfg.secretAccessKey && cfg.bucketName);
}

/**
 * Native AWS Signature Version 4 signer using Web Crypto API
 * Zero dependencies, ultra-fast and works directly in any browser.
 */
async function hmacSha256(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
}

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getSigningKey(secretKey: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + secretKey), dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  return hmacSha256(kService, 'aws4_request');
}

/**
 * Execute an authenticated S3 request to Cloudflare R2
 */
async function r2Request(
  cfg: R2Config,
  method: 'GET' | 'PUT',
  key: string,
  body?: Uint8Array,
  contentType = 'application/octet-stream'
): Promise<Response> {
  const endpoint = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const url = `https://${endpoint}/${cfg.bucketName}/${key}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const region = 'auto';
  const service = 's3';

  const payloadHash = body ? await sha256Hex(body) : await sha256Hex('');

  const canonicalUri = `/${cfg.bucketName}/${key}`;
  const canonicalHeaders =
    `host:${endpoint}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest =
    `${method}\n` +
    `${canonicalUri}\n` +
    `\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`;

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign =
    `AWS4-HMAC-SHA256\n` +
    `${amzDate}\n` +
    `${credentialScope}\n` +
    (await sha256Hex(canonicalRequest));

  const signingKey = await getSigningKey(cfg.secretAccessKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers: Record<string, string> = {
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    Authorization: authHeader
  };

  if (body) {
    headers['Content-Type'] = contentType;
  }

  return fetch(url, {
    method,
    headers,
    body: body as any
  });
}

/**
 * Upload an image file directly to Cloudflare R2 bucket
 */
export async function uploadImageToR2(file: File): Promise<string> {
  const cfg = getR2Config();
  const fileExt = file.name.split('.').pop() || 'webp';
  const fileName = `images/${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${fileExt}`;

  if (cfg && isR2Configured()) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const res = await r2Request(cfg, 'PUT', fileName, bytes, file.type || 'image/webp');
      if (res.ok) {
        if (cfg.publicDomain) {
          const base = cfg.publicDomain.endsWith('/') ? cfg.publicDomain.slice(0, -1) : cfg.publicDomain;
          const publicUrl = `${base}/${fileName}`;
          await saveMediaItem(fileName, publicUrl);
          return publicUrl;
        }
      }
    } catch (err) {
      console.warn('Cloudflare R2 image upload error:', err);
    }
  }

  // Fallback to local DataURL & IndexedDB if R2 is not configured
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      await saveMediaItem(fileName, url);
      resolve(url);
    };
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}

/**
 * Save complete couple data (Memories, Comfort Doors, Nicknames, Jokes, Timeline, Notes, Bucket List) to Cloudflare R2
 */
export async function saveAllDataToR2(data: any): Promise<boolean> {
  const cfg = getR2Config();
  if (!cfg || !isR2Configured()) return false;

  try {
    const jsonString = JSON.stringify(data, null, 2);
    const bytes = new TextEncoder().encode(jsonString);

    const res = await r2Request(cfg, 'PUT', 'our_universe_data.json', bytes, 'application/json');
    if (res.ok) {
      console.log('✨ All 7 couple features safely synced to Cloudflare R2!');
      return true;
    }
  } catch (err) {
    console.warn('Cloudflare R2 data sync error:', err);
  }
  return false;
}

/**
 * Load complete couple data from Cloudflare R2 bucket
 */
export async function loadAllDataFromR2(): Promise<any | null> {
  const cfg = getR2Config();
  if (!cfg || !isR2Configured()) return null;

  try {
    const res = await r2Request(cfg, 'GET', 'our_universe_data.json');
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (err) {
    console.warn('Cloudflare R2 fetch note:', err);
  }
  return null;
}
