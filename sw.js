// ทุกครั้งที่แก้ไฟล์ในเว็บ ให้เปลี่ยนเลขเวอร์ชันนี้ เพื่อให้มือถือโหลดของใหม่
const VERSION = "qd-v1";
const FILES = [
  "./", "index.html", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "fonts/mitr-thai-500-normal.woff2", "fonts/mitr-thai-600-normal.woff2",
  "fonts/mitr-latin-500-normal.woff2", "fonts/mitr-latin-600-normal.woff2",
  "fonts/sarabun-thai-400-normal.woff2", "fonts/sarabun-thai-500-normal.woff2", "fonts/sarabun-thai-700-normal.woff2",
  "fonts/sarabun-latin-400-normal.woff2", "fonts/sarabun-latin-500-normal.woff2", "fonts/sarabun-latin-700-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ใช้ของในเครื่องก่อนเสมอ (เปิดได้ทันทีแม้เน็ตช้าหรือเว็บถูกบล็อก)
// ถ้ามีเน็ต จะแอบโหลดหน้าเว็บใหม่มาเก็บไว้สำหรับครั้งหน้า
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const key = req.mode === "navigate" ? "index.html" : req;
      const hit = await cache.match(key, { ignoreSearch: true });
      const net = fetch(req).then(res => {
        if (res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => hit);
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    })
  );
});
