(() => {
const C = window.CONFIG;
const DB = window.MsgDB;
const API = `https://api.github.com/repos/${C.owner}/${C.repo}/contents/messages.json?ref=${C.branch}`;
const RAW_API = `https://raw.githubusercontent.com/${C.owner}/${C.repo}/${C.branch}/messages.json`;

// ═══════════════════════════════════════════════════════
// 🔐 چک ثبت‌نام
// ═══════════════════════════════════════════════════════
const isRegistered = localStorage.getItem('registered') === 'true'; 
const hasName      = !!localStorage.getItem('myName');

if (!isRegistered || !hasName) {
  location.href = './register.html';
  return;
}

// ═══════════════════════════════════════════════════════
// 👑 بررسی ادمین
// ═══════════════════════════════════════════════════════
try {
  const hash = location.hash;
  if (hash === '#admin' || hash === '#admin-panel') {
    localStorage.setItem('isAdmin', 'true');
    setTimeout(() => { try { history.replaceState(null, '', location.pathname); } catch(e){} }, 100);
  }
  if (hash === '#logout-admin') {
    localStorage.removeItem('isAdmin');
    setTimeout(() => { try { history.replaceState(null, '', location.pathname); } catch(e){} }, 100);
  }
} catch(e) {}

const state = {
  messages: [], reactions: [], replies: [], seen: [],
  myName: localStorage.getItem('myName') || '',
  myGroup: localStorage.getItem('myGroup') || 'friends',
  filter: 'all'
};

const INITIAL_COUNT = 3;
const LOAD_STEP = 7;

// ═══════════════════════════════════════════════════════
// 📦 ابزارها
// ═══════════════════════════════════════════════════════
function b64decode(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

function fmtTime(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60)    return 'الان';
  if (diff < 3600)  return Math.floor(diff / 60) + ' دقیقه پیش';
  if (diff < 86400) return Math.floor(diff / 3600) + ' ساعت پیش';
  return d.toLocaleDateString('fa-IR');
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function setStatus(txt, err) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = txt || '';
  el.className = 'status' + (err ? ' err' : '');
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID()
                           : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

// ═══════════════════════════════════════════════════════
// 💾 ذخیره محلی
// ═══════════════════════════════════════════════════════
async function saveLocal() {
  try { await DB.set('messages',  state.messages);  } catch(e) {}
  try { await DB.set('reactions', state.reactions); } catch(e) {}
  try { await DB.set('replies',   state.replies);   } catch(e) {}
  try { await DB.set('seen',      state.seen);      } catch(e) {}
}

async function loadLocal() {
  try {
    state.messages  = (await DB.get('messages'))  || [];
    state.reactions = (await DB.get('reactions')) || [];
    state.replies   = (await DB.get('replies'))   || [];
    state.seen      = (await DB.get('seen'))      || [];
    if (state.messages.length) render();
  } catch(e) {}
}

// ═══════════════════════════════════════════════════════
// 📶 آنلاین/آفلاین
// ═══════════════════════════════════════════════════════
function updateOnlineBadge() {
  const el = document.getElementById('offline');
  if (el) el.hidden = navigator.onLine;
}
window.addEventListener('online',  () => { updateOnlineBadge(); loadMessages(true); });
window.addEventListener('offline', updateOnlineBadge);

// ═══════════════════════════════════════════════════════
// 📥 دریافت پیام‌ها از گیت‌هاب (با raw برای سرعت)
// ═══════════════════════════════════════════════════════
async function loadMessages(force) {
  if (!navigator.onLine) { setStatus('📴 آفلاین'); return; }

  try {
    const url = RAW_API + '?t=' + Date.now();
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const db = await res.json();

    state.messages  = db.messages  || [];
    state.reactions = db.reactions || [];
    state.replies   = db.replies   || [];
    state.seen      = db.seen      || [];

    await saveLocal();
    render();
    setStatus('');

  } catch(e) {
    try {
      const localMessages = await DB.get('messages');
      if (localMessages && localMessages.length) {
        state.messages  = localMessages;
        state.reactions = (await DB.get('reactions')) || [];
        state.replies   = (await DB.get('replies'))   || [];
        state.seen      = (await DB.get('seen'))      || [];
        render();
        setStatus('📴 حالت آفلاین — نسخه ذخیره‌شده');
        return;
      }
    } catch(e2) {}

    setStatus('خطا: ' + e.message, true);
  }
}

// ═══════════════════════════════════════════════════════
// 🎨 نمایش صفحه
// ═══════════════════════════════════════════════════════
function render() {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminEntry = document.getElementById('adminEntry');
  if (adminEntry) adminEntry.hidden = !isAdmin;

  const tabs = document.getElementById('tabs');
  const feed = document.getElementById('feed');
  if (!tabs || !feed) return;

  const groups = [['all', '🌐 همه']];
  Object.entries(C.groups).forEach(([k, g]) => {
    groups.push([k, g.emoji + ' ' + g.name]);
  });

  tabs.innerHTML = groups.map(([k, label]) =>
    '<button data-g="' + k + '" class="' + (state.filter === k ? 'active' : '') + '">' + label + '</button>'
  ).join('');

  tabs.querySelectorAll('button').forEach(b => {
    b.onclick = () => { state.filter = b.dataset.g; render(); };
  });

  const list = state.messages
    .filter(m => state.filter === 'all' || m.group === state.filter)
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  if (!list.length) {
    feed.innerHTML = '<div class="empty">هنوز پیامی نیست 🌱</div>';
    return;
  }

  const currentLimit = parseInt(localStorage.getItem('feedLimit') || INITIAL_COUNT, 10);
  const visible = list.slice(0, currentLimit);
  const hasMore = list.length > currentLimit;

  feed.innerHTML = visible.map(m => renderMessageCard(m)).join('');

  if (hasMore) {
    const btn = document.createElement('div');
    btn.style.cssText = 'text-align:center; margin: 20px 0 12px;';
    btn.innerHTML = '<button id="loadMoreBtn" style="padding:14px 32px; background:linear-gradient(135deg,#1e40af,#3b82f6); color:#fff; border:none; border-radius:14px; cursor:pointer; font-family:inherit; font-size:16px; font-weight:700; box-shadow:0 6px 20px rgba(30,64,175,.35);">نمایش پیام‌های بیشتر 👇</button>';
    feed.appendChild(btn);
    document.getElementById('loadMoreBtn').onclick = () => {
      localStorage.setItem('feedLimit', currentLimit + LOAD_STEP);
      render();
    };
  } else if (list.length > INITIAL_COUNT) {
    const btn = document.createElement('div');
    btn.style.cssText = 'text-align:center; margin: 20px 0 12px;';
    btn.innerHTML = '<button id="showLessBtn" style="padding:10px 24px; background:transparent; color:#5b7ba6; border:1.5px solid #bfdbfe; border-radius:12px; cursor:pointer; font-family:inherit; font-size:14px; font-weight:600;">نمایش کمتر ☝️</button>';
    feed.appendChild(btn);
    document.getElementById('showLessBtn').onclick = () => {
      localStorage.setItem('feedLimit', INITIAL_COUNT);
      render();
    };
  }

  feed.querySelectorAll('.reactions button[data-emoji]').forEach(b => {
    b.onclick = () => sendReaction(b.dataset.mid, b.dataset.emoji);
  });
  feed.querySelectorAll('.reply-btn').forEach(b => {
    b.onclick = () => openReply(b.dataset.mid);
  });
  feed.querySelectorAll('img.img').forEach(im => {
    im.onclick = () => window.open(im.dataset.full, '_blank');
  });

  observeSeen();
}

// ═══════════════════════════════════════════════════════
// 🎴 کارت پیام
// ═══════════════════════════════════════════════════════
function renderMessageCard(m) {
  const rx = state.reactions.filter(r => r.messageId === m.id);
  const grouped = {};
  rx.forEach(r => { grouped[r.emoji] = (grouped[r.emoji] || 0) + 1; });

  const chips = Object.entries(grouped).map(([e, n]) =>
    '<button data-mid="' + m.id + '" data-emoji="' + e + '">' + e + ' <span class="badge">' + n + '</span></button>'
  ).join('');

  const EMOJIS = ['❤️', '👍', '😂', '😮', '😢'];
  const palette = EMOJIS.map(e =>
    grouped[e] ? '' : '<button data-mid="' + m.id + '" data-emoji="' + e + '">' + e + '</button>'
  ).join('');

  const replies = state.replies
    .filter(r => r.messageId === m.id)
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  const repliesHtml = replies.length ? (
    '<div class="replies">' +
    replies.map(r =>
      '<div class="reply"><b>' + esc(r.from) + '</b> <time>' + fmtTime(r.time) + '</time><div>' + esc(r.text) + '</div></div>'
    ).join('') +
    '</div>'
  ) : '';

  const seenBy = state.seen.filter(s => s.messageId === m.id);
  const seenHtml = seenBy.length ? '<span class="seen-badge">👁 ' + seenBy.length + '</span>' : '';

  const g = C.groups[m.group];
  const imgHtml = m.image
    ? '<img class="img" src="' + esc(m.image) + '" loading="lazy" alt="" data-full="' + esc(m.image) + '">'
    : '';

  return (
    '<article class="card" data-mid="' + m.id + '">' +
      (m.text ? '<div class="text">' + esc(m.text) + '</div>' : '') +
      imgHtml +
      '<div class="meta"><span>' + (g ? g.emoji + ' ' + g.name : '') + '</span><span>' + fmtTime(m.time) + '</span></div>' +
      '<div class="reactions">' + chips + palette + seenHtml +
        '<button class="reply-btn" data-mid="' + m.id + '">💬 پاسخ</button>' +
      '</div>' +
      repliesHtml +
    '</article>'
  );
}

// ═══════════════════════════════════════════════════════
// ❤️ ری‌اکشن
// ═══════════════════════════════════════════════════════
async function sendReaction(messageId, emoji) {
  if (!state.myName) return setStatus('اول از ⚙️ نامت رو وارد کن', true);
  try {
    await fetch(C.ntfyBase + '/' + C.interactionsTopic, {
      method: 'POST',
      body: JSON.stringify({ type: 'reaction', messageId: messageId, emoji: emoji, from: state.myName })
    });
    state.reactions.push({
      id: 'local-' + uid(),
      messageId: messageId, emoji: emoji, from: state.myName,
      time: new Date().toISOString()
    });
    render();
  } catch(e) { setStatus('خطا: ' + e.message, true); }
}

// ═══════════════════════════════════════════════════════
// 💬 پاسخ
// ═══════════════════════════════════════════════════════
let replyTargetId = null;

function openReply(mid) {
  if (!state.myName) return setStatus('اول از ⚙️ نامت رو وارد کن', true);
  replyTargetId = mid;
  const m = state.messages.find(x => x.id === mid);
  const q = document.getElementById('replyQuote');
  const t = document.getElementById('replyText');
  const dlg = document.getElementById('replyDlg');
  if (!q || !t || !dlg) return;
  q.textContent = m && m.text ? m.text : '[عکس]';
  t.value = '';
  dlg.showModal();
  setTimeout(() => t.focus(), 50);
}

async function submitReply() {
  const t = document.getElementById('replyText');
  if (!t) return;
  const text = t.value.trim();
  if (!text || !replyTargetId) return;
  try {
    await fetch(C.ntfyBase + '/' + C.interactionsTopic, {
      method: 'POST',
      body: JSON.stringify({ type: 'reply', messageId: replyTargetId, text: text, from: state.myName })
    });
    state.replies.push({
      id: 'local-' + uid(),
      messageId: replyTargetId, text: text,
      from: state.myName, time: new Date().toISOString()
    });
    const dlg = document.getElementById('replyDlg');
    if (dlg) dlg.close();
    replyTargetId = null;
    render();
  } catch(e) { setStatus('خطا: ' + e.message, true); }
}

// ═══════════════════════════════════════════════════════
// 👁 seen
// ═══════════════════════════════════════════════════════
let seenSent = new Set();
try {
  seenSent = new Set(JSON.parse(localStorage.getItem('seenSent') || '[]'));
} catch(e) {}

let seenObserver = null;

function observeSeen() {
  if (seenObserver) seenObserver.disconnect();
  if (!state.myName) return;
  seenObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const mid = e.target.dataset.mid;
      if (mid) sendSeen(mid);
      seenObserver.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.card[data-mid]').forEach(c => seenObserver.observe(c));
}

function sendSeen(messageId) {
  if (!state.myName || seenSent.has(messageId)) return;
  seenSent.add(messageId);
  try {
    localStorage.setItem('seenSent', JSON.stringify(Array.from(seenSent).slice(-1000)));
  } catch(e) {}
  fetch(C.ntfyBase + '/' + C.interactionsTopic, {
    method: 'POST',
    body: JSON.stringify({ type: 'seen', messageId: messageId, from: state.myName })
  }).catch(() => {});
}

// ═══════════════════════════════════════════════════════
// 🔄 SSE
// ═══════════════════════════════════════════════════════
function subscribeSSE() {
  try {
    const myTopic = C.groups[state.myGroup] && C.groups[state.myGroup].topic;
    if (myTopic) {
      const es = new EventSource(C.ntfyBase + '/' + myTopic + '/sse');
      es.onmessage = ev => {
        try {
          const d = JSON.parse(ev.data);
          if (d.event === 'message' && d.message) {
            setTimeout(() => loadMessages(true), 500);
          }
        } catch(e) {}
      };
      es.onerror = () => {};
    }

    const esIx = new EventSource(C.ntfyBase + '/' + C.interactionsTopic + '/sse');
    esIx.onmessage = ev => {
      try {
        const d = JSON.parse(ev.data);
        if (d.event !== 'message') return;
        const data = JSON.parse(d.message);
        const iso = new Date((d.time || Date.now() / 1000) * 1000).toISOString();

        if (data.type === 'reaction') {
          if (state.reactions.some(r => r.id === d.id)) return;
          if (data.from === state.myName) {
            const i = state.reactions.findIndex(r =>
              r.id.indexOf('local-') === 0 && r.messageId === data.messageId && r.emoji === data.emoji);
            if (i >= 0) state.reactions.splice(i, 1);
          }
          state.reactions.push({
            id: d.id, messageId: data.messageId,
            emoji: data.emoji, from: data.from, time: iso
          });
        } else if (data.type === 'reply') {
          if (state.replies.some(r => r.id === d.id)) return;
          if (data.from === state.myName) {
            const i = state.replies.findIndex(r =>
              r.id.indexOf('local-') === 0 && r.messageId === data.messageId && r.text === data.text);
            if (i >= 0) state.replies.splice(i, 1);
          }
          state.replies.push({
            id: d.id, messageId: data.messageId,
            text: data.text, from: data.from, time: iso
          });
        } else if (data.type === 'seen') {
          if (state.seen.some(s => s.messageId === data.messageId && s.from === data.from)) return;
          state.seen.push({ messageId: data.messageId, from: data.from, time: iso });
        } else return;

        saveLocal();
        render();
      } catch(e) {}
    };
    esIx.onerror = () => {};
  } catch(e) {}
}

// ═══════════════════════════════════════════════════════
// ⚙️ تنظیمات
// ═══════════════════════════════════════════════════════
function setupSettings() {
  const dlg = document.getElementById('settingsDlg');
  const sel = document.getElementById('myGroup');
  const nameInput = document.getElementById('myName');
  if (!dlg || !sel || !nameInput) return;

  sel.innerHTML = Object.entries(C.groups).map(([k, g]) =>
    '<option value="' + k + '">' + g.emoji + ' ' + g.name + '</option>'
  ).join('');

  nameInput.value = state.myName;
  sel.value = state.myGroup;

  const btn = document.getElementById('settingsBtn');
  if (btn) btn.onclick = () => dlg.showModal();

  dlg.addEventListener('close', () => {
    const n = nameInput.value.trim();
    if (n) state.myName = n;
    state.myGroup = sel.value;
    localStorage.setItem('myName', state.myName);
    localStorage.setItem('myGroup', state.myGroup);
    observeSeen();
  });

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.onclick = () => loadMessages(true);

  const replyBtn = document.getElementById('replySendBtn');
  if (replyBtn) replyBtn.onclick = submitReply;
}

// ═══════════════════════════════════════════════════════
// 🚀 شروع
// ═══════════════════════════════════════════════════════
async function init() {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    updateOnlineBadge();
    setupSettings();
    await loadLocal();
    await loadMessages(true);
    subscribeSSE();
    setInterval(() => loadMessages(true), 5 * 60 * 1000);
  } catch(e) {
    console.error('init error:', e);
  }
}

init();
})();
