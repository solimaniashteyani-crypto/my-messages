// ═══════════════════════════════════════════════════════
// Service Worker — غیرفعال
// ═══════════════════════════════════════════════════════
// ما از RAW_API (raw.githubusercontent.com) استفاده می‌کنیم
// که خودش CDN داره و نیازی به کش نداره.
//
// این Service Worker فقط برای پاک کردن کش قدیمی.
// ═══════════════════════════════════════════════════════

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())  // ← خودش رو حذف کن
  );
});

// هیچ کش نکن — همه چیز از شبکه
self.addEventListener('fetch', event => {
  // بدون کش — همه چیز از شبکه
});
