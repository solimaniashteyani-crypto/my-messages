window.MsgDB = (() => {
  const DB_NAME = 'chal-db';
  const VERSION = 1;
  let dbp = null;

  function open() {
    if (!dbp) dbp = new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
      };
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
    return dbp;
  }

  async function get(key) {
    const d = await open();
    return new Promise((res, rej) => {
      const r = d.transaction('kv','readonly').objectStore('kv').get(key);
      r.onsuccess = () => res(r.result);
      r.onerror   = () => rej(r.error);
    });
  }

  async function set(key, val) {
    const d = await open();
    return new Promise((res, rej) => {
      const r = d.transaction('kv','readwrite').objectStore('kv').put(val, key);
      r.onsuccess = () => res();
      r.onerror   = () => rej(r.error);
    });
  }

  return { get, set };
})();