const V='netsim-v3',F=['./','index.html','style.css','app.js','engine.js','pdf.js','i18n.js','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(r=>{const n=fetch(e.request).then(res=>{if(res.ok)caches.open(V).then(c=>c.put(e.request,res.clone()));return res}).catch(()=>r);return r||n}))});
