const C="dictation-v1";
const V="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
const A=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png",V+"pdf.min.js",V+"pdf.worker.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(new Request(u,{mode:"cors"})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const same=new URL(r.url).origin===location.origin;
  if(same){
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(C).then(c=>c.put(r,cp)); } return res; })
      .catch(()=>caches.match(r).then(x=>x||caches.match("index.html"))));
  } else {
    e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(C).then(c=>c.put(r,cp)); } return res; })));
  }
});
