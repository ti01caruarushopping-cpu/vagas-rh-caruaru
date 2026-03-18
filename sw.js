var CACHE_NAME = 'vagas-rh-v1';
var ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(fetch(e.request).catch(function() {
      return new Response(JSON.stringify({status:'erro',error:'Sem conexão'}), {headers:{'Content-Type':'application/json'}});
    }));
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(res) {
      var clone = res.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
      return res;
    }).catch(function() { return caches.match(e.request); })
  );
});
