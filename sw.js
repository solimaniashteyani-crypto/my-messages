// ═══════════════════════════════════════════════════════
// Service Worker — سامانه پیام‌رسان سما
// HTML/JS/CSS/JSON همیشه از شبکه (تازه‌ترین نسخه)
// ═══════════════════════════════════════════════════════

const CACHE = 'sama-' + Date.now();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !k.startsWith('sama-')).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // 1. API گیت‌هاب → همیشه از شبکه
  if (url.hostname === 'api.github.com') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // 2. فایل‌های اصلی → همیشه از شبکه
  const isCoreFile =
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js')   ||
    url.pathname.endsWith('.css')  ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('/my-messages/') ||
    url.pathname.endsWith('/my-messages');

  if (isCoreFile) {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // 3. بقیه (عکس‌ها، فونت‌ها) → cache-first
  e.respondWith(
    caches.match(e.request).then(r =>
      r || fetch(e.request).then(res => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
    )
  );
});
