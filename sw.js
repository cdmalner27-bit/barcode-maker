// Network first, so updates arrive as soon as the phone is online; the cache is the offline fallback.
var CACHE = "barcode-maker-v1";
var CORE = [
  "./",
  "manifest.json",
  "icon-192.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js",
  "https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && (res.ok || res.type === "opaque")) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
        return hit || Response.error();
      });
    })
  );
});
