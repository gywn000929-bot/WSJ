const CACHE='wsj-study-v1';
self.addEventListener('install',e=>{ self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./widget-data.json']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return; // 외부(Firebase/사전/번역)는 그대로 네트워크
  const isDoc=e.request.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('index.html');
  if(isDoc){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;})
      .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  }else{
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(rr=>{const c=rr.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return rr;})));
  }
});
