// ═══════════════════════════════════════════════════════
// Service Worker — غیرفعال کامل (نسخه ۹)
// ═══════════════════════════════════════════════════════

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(keys.map(function(k) { return caches.delete(k); }));
      })
      .then(function() {
        // خودش رو حذف کن
        return self.registration.unregister();
      })
      .then(function() {
        // همه تب‌ها رو رفرش کن
        return self.clients.matchAll({ type: 'window' });
      })
      .then(function(clients) {
        clients.forEach(function(client) {
          try { client.navigate(client.url); } catch(e) {}
        });
      })
  );
});

self.addEventListener('fetch', function(event) {
  // هیچ کش نکن — همیشه از شبکه
  event.respondWith(fetch(event.request));
});
