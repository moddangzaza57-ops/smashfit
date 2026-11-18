/* Smash Fit service worker — ทำให้แอปเปิดได้แม้ไม่มีเน็ต
   เวลาอัปเดตแอป: build.py จะเปลี่ยน VERSION ให้อัตโนมัติ */
const VERSION='20261118144514';
const CACHE='smashfit-'+VERSION;
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('smashfit-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // หน้าแอป: ลองเน็ตก่อน (ได้เวอร์ชันใหม่) ถ้าไม่มีเน็ตใช้ของในเครื่อง
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  // ฟอนต์ Google: ใช้ของในเครื่องก่อน แล้วอัปเดตเบื้องหลัง
  if(url.hostname.endsWith('fonts.googleapis.com')||url.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.open(CACHE+'-fonts').then(c=>c.match(req).then(hit=>{const net=fetch(req).then(r=>{c.put(req,r.clone());return r}).catch(()=>hit);return hit||net})));
    return;
  }
  if(url.origin===location.origin)e.respondWith(caches.match(req).then(hit=>hit||fetch(req)));
});
