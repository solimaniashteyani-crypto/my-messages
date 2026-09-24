// ═══════════════════════════════════════════════════════
// Service Worker — غیرفعال کامل
// ─────────────────────────────────────────────────────
// این SW فقط برای پاک کردن خودش و همه کش‌هاست
// هیچ کشی نمی‌کنه — همه چیز مستقیم از شبکه
// ═══════════════════════════════════════════════════════

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => {
        clients.forEach(client => {
          try { client.navigate(client.url); } catch(e) {}
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // هیچ کش نکن — همیشه از شبکه
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  );
});
