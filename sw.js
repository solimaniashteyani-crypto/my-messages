// Service Worker — غیرفعال
// همه چیز از شبکه لود میشه

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});

self.addEventListener('fetch', e => {
  // هیچ کشی نکن
  e.respondWith(fetch(e.request));
});
