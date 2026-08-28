/**
 * Browser Cache Buster & Storage Cleaner for Our Universe
 */

// Auto-purge stale legacy caches on script evaluation
export function autoPurgeLegacyCache(): void {
  try {
    const legacyKeys = [
      'asmi_couple_store_v1',
      'asmi_couple_store_v2',
      'asmi_partners_backup',
      'asmi_media_cache'
    ];
    for (const key of legacyKeys) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('Legacy cache purge warning:', e);
  }
}

// Run immediately on boot
autoPurgeLegacyCache();

/**
 * Perform a complete 100% deep wipe of all local caches and reload cleanly from Cloud
 */
export async function clearBrowserCacheAndReload(): Promise<void> {
  try {
    // 1. Clear LocalStorage and SessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Clear CacheStorage (Service Worker / PWA caches)
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    // 3. Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }

    // 4. Delete IndexedDB
    if ('indexedDB' in window) {
      try {
        indexedDB.deleteDatabase('our_universe_media_db');
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Cache clear note:', err);
  }

  // Force hard reload from server
  window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
}
