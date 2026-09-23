// ═══════════════════════════════════════════════════════
// Service Worker — سامانه پیام‌رسان سما
// نسخه ۷ — بدون کش برای فایل‌های اصلی
// ───────────────────────────────────────────────────────
// هدف: همیشه نسخه تازه از سایت بیاد
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'sama-v7-' + Date.now();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // API گیت‌هاب → همیشه از شبکه
  if (url.hostname === 'api.github.com') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // همه فایل‌های HTML، JS، CSS، JSON → همیشه از شبکه (تازه)
  const isCoreFile =
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js')   ||
    url.pathname.endsWith('.css')  ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('/my-messages/') ||
    url.pathname.endsWith('/my-messages') ||
    url.pathname.endsWith('/');

  if (isCoreFile) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // بقیه (عکس‌ها، فونت‌ها) → cache-first با fallback شبکه
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      });
    })
  );
});
