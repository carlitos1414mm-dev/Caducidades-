const PREFIX='caducidades-';
const V=PREFIX+'v2';
const FILES=['./','./index.html','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];
/* Archivos opcionales del OCR (foto de etiqueta). Si aún no los subes, no pasa nada. */
const OCR=['./ocr/tesseract.min.js','./ocr/worker.min.js','./ocr/tesseract-core-simd-lstm.wasm.js','./ocr/tesseract-core-lstm.wasm.js','./ocr/spa.traineddata','./ocr/spa.traineddata.gz'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(async c=>{
    await c.addAll(FILES);
    await Promise.all(OCR.map(f=>c.add(f).catch(()=>{})));
  }));
});
self.addEventListener('activate',e=>{
  /* Solo borra cachés viejos de ESTA app; no toca los de tus otras PWA en el mismo dominio */
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(PREFIX)&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      if(res&&res.ok&&res.status===200){const copy=res.clone();caches.open(V).then(c=>c.put(e.request,copy))}
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
