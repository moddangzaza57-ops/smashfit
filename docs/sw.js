/* Smash Fit service worker — ทำให้แอปเปิดได้แม้ไม่มีเน็ต
   เวลาอัปเดตแอป: build.py จะเปลี่ยน VERSION ให้อัตโนมัติ */
const VERSION='20261118153902';
const CACHE='smashfit-'+VERSION;
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
// ล้างแคชเวอร์ชันเก่า แต่เก็บ smashfit-voice (เสียงพากย์) และฟอนต์ไว้ถาวร ไม่ต้องโหลดใหม่ทุกครั้งที่อัปเดตแอป
const KEEP=k=>k===CACHE||k==='smashfit-voice'||k.endsWith('-fonts');
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('smashfit-')&&!KEEP(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
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
  if(url.origin!==location.origin)return;
  // รายการเสียงพากย์: ลองเน็ตก่อน (ได้เสียงชุดใหม่) ถ้าไม่มีเน็ตใช้ของในเครื่อง
  if(url.pathname.endsWith('/audio/voice.json')){
    e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}).catch(()=>caches.match(req)));
    return;
  }
  // ไฟล์เสียงพากย์: ใช้ของที่เก็บไว้ใน smashfit-voice ก่อนเสมอ (หน้าแอปเป็นคนเก็บ)
  if(url.pathname.includes('/audio/')&&url.pathname.endsWith('.mp3')){
    e.respondWith(caches.open('smashfit-voice').then(c=>c.match(req)).then(hit=>hit||caches.match(req)).then(hit=>hit||fetch(req)));
    return;
  }
  // ไฟล์อื่นในเว็บ (ไอคอน): ใช้ของในเครื่องก่อน ถ้ายังไม่มีโหลดแล้วเก็บไว้ใช้ตอนออฟไลน์
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok&&r.type==='basic'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})));
});
