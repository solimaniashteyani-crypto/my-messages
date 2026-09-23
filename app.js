(() => {
const C = window.CONFIG;
const DB = window.MsgDB;
const API = `https://api.github.com/repos/${C.owner}/${C.repo}/contents/messages.json?ref=${C.branch}`;

// ═══════════════════════════════════════════════════════
// 🔐 چک ثبت‌نام — اگه کاربر ثبت‌نام نکرده، بفرست به register.html
// ═══════════════════════════════════════════════════════
const isRegistered = localStorage.getItem('registered') === 'true';
const hasName      = !!localStorage.getItem('myName');

if (!isRegistered || !hasName) {
  location.href = './register.html';
  return;
}

// ═══════════════════════════════════════════════════════
// 👑 بررسی ادمین بودن — از URL یا localStorage
// ═══════════════════════════════════════════════════════
// اگه URL شامل #admin باشه → کاربر ادمین میشه
if (location.hash === '#admin' || location.hash === '#admin-panel') {
  localStorage.setItem('isAdmin', 'true');
  // پاک کردن hash از URL (که بار بعدی هم بمونه ولی تمیز باشه)
  setTimeout(() => history.replaceState(null, '', location.pathname), 100);
}
// اگه URL شامل #logout-admin باشه → از حالت ادمین خارج میشه
if (location.hash === '#logout-admin') {
  localStorage.removeItem('isAdmin');
  setTimeout(() => history.replaceState(null, '', location.pathname), 100);
}

const isAdmin = localStorage.getItem('isAdmin') === 'true';
const adminBar = document.getElementById('adminBar');
if (adminBar) {
  adminBar.hidden = !isAdmin;
}
// ═══════════════════════════════════════════════════════
// 👑 نوار ادمین — فقط اگه کاربر مدیر باشه
// ═══════════════════════════════════════════════════════
const isAdmin = localStorage.getItem('isAdmin') === 'true';
const adminBar = document.getElementById('adminBar');
if (adminBar) {
  if (isAdmin) {
    adminBar.hidden = false;
  } else {
    adminBar.hidden = true;
  }
}
const state = {
  messages: [], reactions: [], replies: [], seen: [],
  myName: localStorage.getItem('myName') || '',
  myGroup: localStorage.getItem('myGroup') || 'friends',
  filter: 'all',
  etag: null
};

// ═══════════════════════════════════════════════════════
// 📏 تعداد نمایش اولیه پیام‌ها
// ═══════════════════════════════════════════════════════
const INITIAL_COUNT = 3;
const LOAD_STEP = 7;

// ───── ابزارها ─────
const b64decode = b64 => {
  const bin = atob(b64.replace(/\n/g,''));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
};

const fmtTime = iso => {
  const d = new Date(iso);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60)    return 'الان';
  if (diff < 3600)  return `${Math.floor(diff/60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff/3600)} ساعت پیش`;
  return d.toLocaleDateString('fa-IR');
};

const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const setStatus = (txt, err) => {
  const el = document.getElementById('status');
  el.textContent = txt || '';
  el.className = 'status' + (err ? ' err' : '');
};

const uid = () => (crypto.randomUUID ? crypto.randomUUID()
                                     : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2));

// ───── ذخیره محلی ─────
async function saveLocal() {
  try { await DB.set('messages',  state.messages);  } catch {}
  try { await DB.set('reactions', state.reactions); } catch {}
  try { await DB.set('replies',   state.replies);   } catch {}
  try { await DB.set('seen',      state.seen);      } catch {}
}

async function loadLocal() {
  try {
    state.messages  = (await DB.get('messages'))  || [];
    state.reactions = (await DB.get('reactions')) || [];
    state.replies   = (await DB.get('replies'))   || [];
    state.seen      = (await DB.get('seen'))      || [];
    if (state.messages.length) render();
  } catch {}
}

// ───── آنلاین/آفلاین ─────
function updateOnlineBadge() {
  document.getElementById('offline').hidden = navigator.onLine;
}
window.addEventListener('online',  () => { updateOnlineBadge(); loadMessages(true); });
window.addEventListener('offline', updateOnlineBadge);

// ═══════════════════════════════════════════════════════
// 📥 دریافت پیام‌ها از گیت‌هاب
// ═══════════════════════════════════════════════════════
async function loadMessages(force = false) {
  if (!navigator.onLine) { setStatus('آفلاین'); return; }
  try {
    const headers = {};
    if (state.etag && !force) headers['If-None-Match'] = state.etag;
    const res = await fetch(API + '&t=' + Date.now(), { headers, cache: 'no-store' });
    if (res.status === 304) return;
    if (!res.ok) throw new Error('HTTP ' + res.status);
    state.etag = res.headers.get('etag');
    const data = await res.json();
    const db = JSON.parse(b64decode(data.content));
    state.messages  = db.messages  || [];
    state.reactions = db.reactions || [];
    state.replies   = db.replies   || [];
    state.seen      = db.seen      || [];
    await saveLocal();
    render();
    setStatus('');
  } catch (e) {
    setStatus('خطا: ' + e.message, true);
  }
}

// ═══════════════════════════════════════════════════════
// 🎨 نمایش صفحه
// ═══════════════════════════════════════════════════════
function render() {
  const tabs = document.getElementById('tabs');
  const feed = document.getElementById('feed');

  // ───── تب‌های گروه ─────
  const groups = [['all','🌐 همه'],
    ...Object.entries(C.groups).map(([k,g]) => [k, `${g.emoji} ${g.name}`])];
  tabs.innerHTML = groups.map(([k,label]) =>
    `<button data-g="${k}" class="${state.filter===k?'active':''}">${label}</button>`).join('');
  tabs.querySelectorAll('button').forEach(b =>
    b.onclick = () => { state.filter = b.dataset.g; render(); });

  // ───── لیست پیام‌ها ─────
  const list = state.messages
    .filter(m => state.filter === 'all' || m.group === state.filter)
    .sort((a,b) => new Date(b.time) - new Date(a.time));

  if (!list.length) {
    feed.innerHTML = '<div class="empty">هنوز پیامی نیست 🌱</div>';
    return;
  }

  // ───── محدودیت نمایش ─────
  const currentLimit = parseInt(localStorage.getItem('feedLimit') || INITIAL_COUNT, 10);
  const visible = list.slice(0, currentLimit);
  const hasMore = list.length > currentLimit;

  // ───── رندر پیام‌ها ─────
  feed.innerHTML = visible.map(m => renderMessageCard(m)).join('');

  // ───── دکمه «بیشتر» یا «کمتر» ─────
  if (hasMore) {
    const btn = document.createElement('div');
    btn.style.cssText = 'text-align:center; margin: 20px 0 12px;';
    btn.innerHTML = `
      <button id="loadMoreBtn" style="
        padding:14px 32px;
        background:linear-gradient(135deg,#1e40af,#3b82f6);
        color:#fff;
        border:none;
        border-radius:14px;
        cursor:pointer;
        font-family:inherit;
        font-size:16px;
        font-weight:700;
        box-shadow:0 6px 20px rgba(30,64,175,.35);
        transition:all .2s;
      ">
        نمایش ${Math.min(LOAD_STEP, list.length - currentLimit)} پیام قدیمی‌تر 👇
      </button>
    `;
    feed.appendChild(btn);
    document.getElementById('loadMoreBtn').onclick = () => {
      localStorage.setItem('feedLimit', currentLimit + LOAD_STEP);
      render();
    };
  } else if (list.length > INITIAL_COUNT) {
    const btn = document.createElement('div');
    btn.style.cssText = 'text-align:center; margin: 20px 0 12px;';
    btn.innerHTML = `
      <button id="showLessBtn" style="
        padding:10px 24px;
        background:transparent;
        color:#5b7ba6;
        border:1.5px solid #bfdbfe;
        border-radius:12px;
        cursor:pointer;
        font-family:inherit;
        font-size:14px;
        font-weight:600;
        transition:all .2s;
      ">نمایش کمتر ☝️</button>
    `;
    feed.appendChild(btn);
    document.getElementById('showLessBtn').onclick = () => {
      localStorage.setItem('feedLimit', INITIAL_COUNT);
      render();
    };
  }

  // ───── اتصال رویدادها ─────
  feed.querySelectorAll('.reactions button[data-emoji]').forEach(b =>
    b.onclick = () => sendReaction(b.dataset.mid, b.dataset.emoji));
  feed.querySelectorAll('.reply-btn').forEach(b =>
    b.onclick = () => openReply(b.dataset.mid));
  feed.querySelectorAll('img.img').forEach(im =>
    im.onclick = () => window.open(im.dataset.full, '_blank'));

  observeSeen();
}

// ═══════════════════════════════════════════════════════
// 🎴 ساخت کارت هر پیام
// ═══════════════════════════════════════════════════════
function renderMessageCard(m) {
  const rx = state.reactions.filter(r => r.messageId === m.id);
  const grouped = {};
  for (const r of rx) grouped[r.emoji] = (grouped[r.emoji]||0) + 1;

  const chips = Object.entries(grouped).map(([e,n]) =>
    `<button data-mid="${m.id}" data-emoji="${e}">${e} <span class="badge">${n}</span></button>`
  ).join('');

  const EMOJIS = ['❤️','👍','😂','😮','😢'];
  const palette = EMOJIS.map(e =>
    grouped[e] ? '' : `<button data-mid="${m.id}" data-emoji="${e}">${e}</button>`).join('');

  const replies = state.replies
    .filter(r => r.messageId === m.id)
    .sort((a,b) => new Date(a.time) - new Date(b.time));
  const repliesHtml = replies.length ? `
    <div class="replies">
      ${replies.map(r => `
        <div class="reply">
          <b>${esc(r.from)}</b>
          <time>${fmtTime(r.time)}</time>
          <div>${esc(r.text)}</div>
        </div>`).join('')}
    </div>` : '';

  const seenBy = state.seen.filter(s => s.messageId === m.id);
  const seenHtml = seenBy.length ? `<span class="seen-badge">👁 ${seenBy.length}</span>` : '';

  const g = C.groups[m.group];
  const imgHtml = m.image
    ? `<img class="img" src="${esc(m.image)}" loading="lazy" alt="" data-full="${esc(m.image)}">`
    : '';

  return `
    <article class="card" data-mid="${m.id}">
      ${m.text ? `<div class="text">${esc(m.text)}</div>` : ''}
      ${imgHtml}
      <div class="meta">
        <span>${g ? g.emoji + ' ' + g.name : ''}</span>
        <span>${fmtTime(m.time)}</span>
      </div>
      <div class="reactions">
        ${chips}${palette}
        ${seenHtml}
        <button class="reply-btn" data-mid="${m.id}">💬 پاسخ</button>
      </div>
      ${repliesHtml}
    </article>`;
}

// ═══════════════════════════════════════════════════════
// ❤️ ارسال ری‌اکشن
// ═══════════════════════════════════════════════════════
async function sendReaction(messageId, emoji) {
  if (!state.myName) return setStatus('اول از ⚙️ نامت رو وارد کن', true);
  try {
    await fetch(`${C.ntfyBase}/${C.interactionsTopic}`, {
      method: 'POST',
      body: JSON.stringify({ type: 'reaction', messageId, emoji, from: state.myName })
    });
    state.reactions.push({
      id: 'local-' + uid(), messageId, emoji, from: state.myName,
      time: new Date().toISOString()
    });
    render();
  } catch (e) { setStatus('خطا: ' + e.message, true); }
}

// ═══════════════════════════════════════════════════════
// 💬 پاسخ دادن
// ═══════════════════════════════════════════════════════
let replyTargetId = null;

function openReply(mid) {
  if (!state.myName) return setStatus('اول از ⚙️ نامت رو وارد کن', true);
  replyTargetId = mid;
  const m = state.messages.find(x => x.id === mid);
  document.getElementById('replyQuote').textContent = m?.text || '[عکس]';
  document.getElementById('replyText').value = '';
  document.getElementById('replyDlg').showModal();
  setTimeout(() => document.getElementById('replyText').focus(), 50);
}

async function submitReply() {
  const text = document.getElementById('replyText').value.trim();
  if (!text || !replyTargetId) return;
  try {
    await fetch(`${C.ntfyBase}/${C.interactionsTopic}`, {
      method: 'POST',
      body: JSON.stringify({ type: 'reply', messageId: replyTargetId, text, from: state.myName })
    });
    state.replies.push({
      id: 'local-' + uid(), messageId: replyTargetId, text,
      from: state.myName, time: new Date().toISOString()
    });
    document.getElementById('replyDlg').close();
    replyTargetId = null;
    render();
  } catch (e) { setStatus('خطا: ' + e.message, true); }
}

// ═══════════════════════════════════════════════════════
// 👁 رسید خوانده‌شدن
// ═══════════════════════════════════════════════════════
const seenSent = new Set(JSON.parse(localStorage.getItem('seenSent') || '[]'));
let seenObserver = null;

function observeSeen() {
  if (seenObserver) seenObserver.disconnect();
  if (!state.myName) return;
  seenObserver = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const mid = e.target.dataset.mid;
      if (mid) sendSeen(mid);
      seenObserver.unobserve(e.target);
    }
  }, { threshold: 0.6 });
  document.querySelectorAll('.card[data-mid]').forEach(c => seenObserver.observe(c));
}

function sendSeen(messageId) {
  if (!state.myName || seenSent.has(messageId)) return;
  seenSent.add(messageId);
  localStorage.setItem('seenSent', JSON.stringify([...seenSent].slice(-1000)));
  fetch(`${C.ntfyBase}/${C.interactionsTopic}`, {
    method: 'POST',
    body: JSON.stringify({ type: 'seen', messageId, from: state.myName })
  }).catch(() => {});
}

// ═══════════════════════════════════════════════════════
// 🔄 دریافت بلادرنگ (SSE)
// ═══════════════════════════════════════════════════════
function subscribeSSE() {
  const myTopic = C.groups[state.myGroup]?.topic;
  if (myTopic) {
    const es = new EventSource(`${C.ntfyBase}/${myTopic}/sse`);
    es.onmessage = ev => {
      try {
        const d = JSON.parse(ev.data);
        if (d.event === 'message' && d.message) setTimeout(() => loadMessages(true), 500);
      } catch {}
    };
  }

  const esIx = new EventSource(`${C.ntfyBase}/${C.interactionsTopic}/sse`);
  esIx.onmessage = ev => {
    try {
      const d = JSON.parse(ev.data);
      if (d.event !== 'message') return;
      const data = JSON.parse(d.message);
      const iso = new Date((d.time || Date.now()/1000)*1000).toISOString();

      if (data.type === 'reaction') {
        if (state.reactions.some(r => r.id === d.id)) return;
        if (data.from === state.myName) {
          const i = state.reactions.findIndex(r =>
            r.id.startsWith('local-') && r.messageId === data.messageId && r.emoji === data.emoji);
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
            r.id.startsWith('local-') && r.messageId === data.messageId && r.text === data.text);
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
    } catch {}
  };
}

// ═══════════════════════════════════════════════════════
// ⚙️ تنظیمات
// ═══════════════════════════════════════════════════════
function setupSettings() {
  const dlg = document.getElementById('settingsDlg');
  const sel = document.getElementById('myGroup');
  sel.innerHTML = Object.entries(C.groups)
    .map(([k,g]) => `<option value="${k}">${g.emoji} ${g.name}</option>`).join('');
  document.getElementById('myName').value = state.myName;
  sel.value = state.myGroup;

  document.getElementById('settingsBtn').onclick = () => dlg.showModal();
  dlg.addEventListener('close', () => {
    const n = document.getElementById('myName').value.trim();
    if (n) state.myName = n;
    state.myGroup = sel.value;
    localStorage.setItem('myName',  state.myName);
    localStorage.setItem('myGroup', state.myGroup);
    observeSeen();
  });

  document.getElementById('refreshBtn').onclick = () => loadMessages(true);
  document.getElementById('replySendBtn').onclick = submitReply;
}

// ═══════════════════════════════════════════════════════
// 🚀 شروع
// ═══════════════════════════════════════════════════════
async function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  updateOnlineBadge();
  setupSettings();
  await loadLocal();
  await loadMessages(true);
  subscribeSSE();
  setInterval(() => loadMessages(true), 5 * 60 * 1000);
}

init();
})();
