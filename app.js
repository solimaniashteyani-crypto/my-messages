(() => {
const C = window.CONFIG;
const DB = window.MsgDB;
const RAW_API = `https://raw.githubusercontent.com/${C.owner}/${C.repo}/${C.branch}/messages.json`;
const RAW_ALLOWED = `https://raw.githubusercontent.com/${C.owner}/${C.repo}/${C.branch}/allowed.json`;

// ═══════════════════════════════════════════════════════
// 📥 بارگیری اطلاعات کاربر از allowed.json
// ═══════════════════════════════════════════════════════
async function loadUserInfo() {
  const myPhone = localStorage.getItem('myPhone');
  if (!myPhone) return false;

  try {
    const res = await fetch(RAW_ALLOWED + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const user = (data.allowed || []).find(u => u.phone === myPhone);

    if (!user) {
      // کاربر از لیست حذف شده
      localStorage.clear();
      location.href = './register.html';
      return false;
    }

    // ✅ آپدیت localStorage با اطلاعات تازه
    localStorage.setItem('myName', user.name || 'کاربر');
    localStorage.setItem('myGroups', JSON.stringify(user.groups || []));
    localStorage.setItem('myGroup', (user.groups && user.groups[0]) || 'friends');
    localStorage.setItem('myPersonalTopic', user.personalTopic || '');
    localStorage.setItem('myProvince', user.province || '');

    return true;
  } catch(e) {
    console.error('loadUserInfo error:', e);
    return false;
  }
}

// ═══════════════════════════════════════════════════════
// 🔐 چک ثبت‌نام
// ═══════════════════════════════════════════════════════
const isRegistered = localStorage.getItem('registered') === 'true';
const hasName = !!localStorage.getItem('myName');

if (!isRegistered || !hasName) {
  location.href = './register.html';
  return;
}

// ═══════════════════════════════════════════════════════
// 👑 ادمین
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

const isAdmin = localStorage.getItem('isAdmin') === 'true';

// ═══════════════════════════════════════════════════════
// 🔐 رمز ادمین — اگه ادمین هستی ولی رمز نزدی، نشون بده
// ═══════════════════════════════════════════════════════
if (isAdmin && localStorage.getItem('adminUnlocked') !== 'true') {
  // صفحه رمز
  document.documentElement.innerHTML = `
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>سما — رمز ادمین</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css">
      <style>
        body{
          font-family:Vazirmatn,system-ui,sans-serif;
          background:radial-gradient(1200px 600px at 100% -10%, #93c5fd 0%, transparent 55%),
            radial-gradient(900px 500px at -10% 110%, #bfdbfe 0%, transparent 55%),
            linear-gradient(160deg,#dbeafe 0%, #eff6ff 45%, #fff 100%);
          min-height:100vh; margin:0; padding:20px;
          display:flex; align-items:center; justify-content:center;
        }
        .box{
          background:#fff; border-radius:24px; padding:36px 28px;
          max-width:420px; width:100%; text-align:center;
          box-shadow:0 20px 60px rgba(30,64,175,.2);
        }
        .icon{
          width:100px; height:100px; border-radius:28px;
          background:linear-gradient(135deg,#1e40af,#3b82f6);
          color:#fff; display:inline-flex; align-items:center; justify-content:center;
          font-size:50px; margin-bottom:20px;
          box-shadow:0 16px 40px rgba(30,64,175,.4);
        }
        h1{font-size:24px; color:#1e3a8a; margin:0 0 12px; font-weight:900}
        p{color:#64748b; margin:0 0 24px; line-height:1.8; font-weight:600}
        input{
          width:100%; padding:20px 22px;
          background:#f0f7ff; border:2.5px solid #bfdbfe;
          border-radius:16px; font-family:inherit; font-size:28px;
          font-weight:900; text-align:center; letter-spacing:14px;
          box-sizing:border-box;
        }
        input:focus{outline:none; border-color:#1e40af; background:#fff; box-shadow:0 0 0 6px rgba(30,64,175,.15)}
        button{
          width:100%; padding:18px 24px; margin-top:14px;
          background:linear-gradient(135deg,#1e40af,#3b82f6);
          color:#fff; border:none; border-radius:16px;
          font-family:inherit; font-size:18px; font-weight:900;
          cursor:pointer; box-shadow:0 8px 22px rgba(30,64,175,.4);
        }
        button:active{transform:scale(.98)}
        .err{
          color:#dc2626; margin-top:14px; font-size:15px;
          font-weight:800; min-height:22px;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="icon">🔐</div>
        <h1>رمز ادمین</h1>
        <p>برای ورود به پنل ادمین، رمز ۴ رقمی رو وارد کن</p>
        <input type="password" id="adminPass" placeholder="••••" maxlength="4" inputmode="numeric" autofocus>
        <button onclick="checkAdminPass()">ورود به پنل ادمین 🔓</button>
        <div class="err" id="adminErr"></div>
      </div>
      <script>
        var ADMIN_PASS = '5113';
        function checkAdminPass() {
          var v = document.getElementById('adminPass').value.trim();
          var err = document.getElementById('adminErr');
          if (v === ADMIN_PASS) {
            localStorage.setItem('adminUnlocked', 'true');
            location.reload();
          } else {
            err.textContent = '❌ رمز اشتباه';
            document.getElementById('adminPass').value = '';
          }
        }
        document.getElementById('adminPass').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') checkAdminPass();
        });
      </script>
    </body>
  `;
  return;
}
// ═══════════════════════════════════════════════════════
// 📦 state
// ═══════════════════════════════════════════════════════
const state = {
  messages: [], reactions: [], replies: [], seen: [],
  myName: localStorage.getItem('myName') || '',
  myGroups: [],
  myPersonalTopic: localStorage.getItem('myPersonalTopic') || '',
  filter: 'all',
  etag: null
};

// بارگیری اولیه myGroups
try {
  state.myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
  if (!state.myGroups.length) {
    const g = localStorage.getItem('myGroup');
    if (g) state.myGroups = [g];
  }
} catch(e) {
  const g = localStorage.getItem('myGroup');
  if (g) state.myGroups = [g];
}

const INITIAL_COUNT = 3;
const LOAD_STEP = 7;

// ═══════════════════════════════════════════════════════
// 📦 ابزارها
// ═══════════════════════════════════════════════════════
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
// 📥 دریافت پیام‌ها
// ═══════════════════════════════════════════════════════
async function loadMessages(force) {
  if (!navigator.onLine) { setStatus('📴 آفلاین'); showEmptyIfNeeded(); return; }

  try {
    const url = RAW_API + '?t=' + Date.now();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const db = await res.json();
    const newMessages = db.messages || [];

    if (newMessages.length === 0) {
      const localMessages = await DB.get('messages');
      if (localMessages && localMessages.length > 0) {
        await DB.set('messages',  []);
        await DB.set('reactions', []);
        await DB.set('replies',   []);
        await DB.set('seen',      []);
        try {
          localStorage.removeItem('seenSent');
          localStorage.removeItem('feedLimit');
        } catch(e) {}
      }
    }

    state.messages  = newMessages;
    state.reactions = db.reactions || [];
    state.replies   = db.replies   || [];
    state.seen      = db.seen      || [];

    await saveLocal();
    render();
    setStatus('');
    showEmptyIfNeeded();

  } catch(e) {
    console.error('loadMessages error:', e);
    render();
    showEmptyIfNeeded();
    setStatus('⚠️ ' + e.message, true);
  }
}

// ═══════════════════════════════════════════════════════
// 🎯 چک کن کاربر عضو این گروه هست
// ═══════════════════════════════════════════════════════
function isUserInGroup(groupKey) {
  if (isAdmin) return true;
  return state.myGroups.includes(groupKey);
}

// ═══════════════════════════════════════════════════════
// 🎨 تب‌ها — فقط گروه‌های کاربر
// ═══════════════════════════════════════════════════════
function renderTabs() {
  const tabs = document.getElementById('tabs');
  if (!tabs) return;

  const cats = {
    'خانواده': { emoji: '🏡', items: [] },
    'ویژه':    { emoji: '🕌', items: [] },
    'استان':   { emoji: '🗺', items: [] },
    'سایر':    { emoji: '👥', items: [] }
  };

  Object.entries(C.groups).forEach(([k, g]) => {
    if (!isUserInGroup(k)) return;
    const cat = g.category || 'سایر';
    if (cats[cat]) cats[cat].items.push({ key: k, ...g });
  });

  let html = '';
  html += `<button data-filter="all" class="${state.filter === 'all' ? 'active' : ''}">🌐 همه</button>`;

  Object.entries(cats).forEach(([catName, cat]) => {
    cat.items.forEach(g => {
      html += `<button data-filter="group:${g.key}" class="${state.filter === 'group:' + g.key ? 'active' : ''}">${g.emoji} ${g.name}</button>`;
    });
  });

  tabs.innerHTML = html;

  tabs.querySelectorAll('button[data-filter]').forEach(b => {
    b.onclick = () => {
      state.filter = b.dataset.filter;
      renderTabs();
      render();
    };
  });
}

// ═══════════════════════════════════════════════════════
// 🎨 رندر
// ═══════════════════════════════════════════════════════
function render() {
  const isAdminNow = localStorage.getItem('isAdmin') === 'true';
  const adminEntry = document.getElementById('adminEntry');
  if (adminEntry) adminEntry.hidden = !isAdminNow;

  renderTabs();

  const feed = document.getElementById('feed');
  if (!feed) return;

  let list = state.messages.slice();

  if (state.filter === 'all') {
    if (!isAdmin) {
      list = list.filter(m => {
        const groups = m.groups || (m.group ? [m.group] : []);
        return groups.some(g => state.myGroups.includes(g));
      });
    }
  } else if (state.filter.startsWith('group:')) {
    const g = state.filter.substring(6);
    list = list.filter(m => {
      const groups = m.groups || (m.group ? [m.group] : []);
      return groups.includes(g);
    });
  }

  list.sort((a, b) => new Date(b.time) - new Date(a.time));

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

  const msgGroups = m.groups || (m.group ? [m.group] : []);
  const groupLabels = msgGroups
    .map(g => C.groups[g])
    .filter(g => g)
    .map(g => g.emoji + ' ' + g.name)
    .join('، ');

  const imgHtml = m.image
    ? '<img class="img" src="' + esc(m.image) + '" loading="lazy" alt="" data-full="' + esc(m.image) + '">'
    : '';

  return (
    '<article class="card" data-mid="' + m.id + '">' +
      (m.text ? '<div class="text">' + esc(m.text) + '</div>' : '') +
      imgHtml +
      '<div class="meta"><span>' + (groupLabels || '—') + '</span><span>' + fmtTime(m.time) + '</span></div>' +
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
  if (!state.myName) return setStatus('اول وارد شو', true);
  try {
    await fetch(C.ntfyBase + '/' + C.interactionsTopic, {
      method: 'POST',
      body: JSON.stringify({ type: 'reaction', messageId, emoji, from: state.myName })
    });
    state.reactions.push({
      id: 'local-' + uid(), messageId, emoji, from: state.myName,
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
  if (!state.myName) return setStatus('اول وارد شو', true);
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
      body: JSON.stringify({ type: 'reply', messageId: replyTargetId, text, from: state.myName })
    });
    state.replies.push({
      id: 'local-' + uid(), messageId: replyTargetId, text,
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
try { seenSent = new Set(JSON.parse(localStorage.getItem('seenSent') || '[]')); } catch(e) {}

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
  try { localStorage.setItem('seenSent', JSON.stringify(Array.from(seenSent).slice(-1000))); } catch(e) {}
  fetch(C.ntfyBase + '/' + C.interactionsTopic, {
    method: 'POST',
    body: JSON.stringify({ type: 'seen', messageId, from: state.myName })
  }).catch(() => {});
}

// ═══════════════════════════════════════════════════════
// 🔄 SSE
// ═══════════════════════════════════════════════════════
function subscribeSSE() {
  try {
    const subscribed = new Set();

    state.myGroups.forEach(groupKey => {
      const group = C.groups[groupKey];
      if (group && group.topic && !subscribed.has(group.topic)) {
        subscribed.add(group.topic);
        const es = new EventSource(C.ntfyBase + '/' + group.topic + '/sse');
        es.onmessage = ev => {
          try {
            const d = JSON.parse(ev.data);
            if (d.event === 'message' && d.message) setTimeout(() => loadMessages(true), 500);
          } catch(e) {}
        };
        es.onerror = () => {};
      }
    });

    const personalTopic = localStorage.getItem('myPersonalTopic');
    if (personalTopic && !subscribed.has(personalTopic)) {
      subscribed.add(personalTopic);
      const esP = new EventSource(C.ntfyBase + '/' + personalTopic + '/sse');
      esP.onmessage = ev => {
        try {
          const d = JSON.parse(ev.data);
          if (d.event === 'message' && d.message) setTimeout(() => loadMessages(true), 500);
        } catch(e) {}
      };
      esP.onerror = () => {};
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
          state.reactions.push({ id: d.id, messageId: data.messageId, emoji: data.emoji, from: data.from, time: iso });
        } else if (data.type === 'reply') {
          if (state.replies.some(r => r.id === d.id)) return;
          state.replies.push({ id: d.id, messageId: data.messageId, text: data.text, from: data.from, time: iso });
        } else if (data.type === 'seen') {
          if (state.seen.some(s => s.messageId === data.messageId && s.from === data.from)) return;
          state.seen.push({ messageId: data.messageId, from: data.from, time: iso });
        } else return;

        saveLocal(); render();
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

  sel.innerHTML = Object.entries(C.groups)
    .map(([k,g]) => `<option value="${k}">${g.emoji} ${g.name}</option>`).join('');
  nameInput.value = state.myName;
  sel.value = state.myGroup || (state.myGroups[0] || 'friends');

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
  // 👑 دکمه خروج ادمین (فقط اگه ادمینه)
  if (isAdmin) {
    const logoutAdminBtn = document.getElementById('logoutAdminBtn');
    if (logoutAdminBtn) {
      logoutAdminBtn.hidden = false;
      logoutAdminBtn.onclick = () => {
        if (confirm('از پنل ادمین خارج بشی؟ (توکن ذخیره می‌مونه)')) {
          localStorage.removeItem('adminUnlocked');
          location.reload();
        }
      };
    }
  }
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.onclick = () => loadMessages(true);

  const replyBtn = document.getElementById('replySendBtn');
  if (replyBtn) replyBtn.onclick = submitReply;
}

function showEmptyIfNeeded() {
  const tabs = document.getElementById('tabs');
  const feed = document.getElementById('feed');
  if (!tabs || !feed) return;
  if (!feed.innerHTML.trim()) {
    renderTabs();
    feed.innerHTML = '<div class="empty">هنوز پیامی نیست 🌱</div>';
  }
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

    // ✅ بارگیری اطلاعات تازه کاربر از allowed.json
    await loadUserInfo();
    // آپدیت state بعد از بارگیری
    state.myName = localStorage.getItem('myName') || '';
    state.myPersonalTopic = localStorage.getItem('myPersonalTopic') || '';
    try {
      state.myGroups = JSON.parse(localStorage.getItem('myGroups') || '[]');
      if (!state.myGroups.length) {
        const g = localStorage.getItem('myGroup');
        if (g) state.myGroups = [g];
      }
    } catch(e) {}

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
