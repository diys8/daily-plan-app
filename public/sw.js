const CACHE = "dp-v2";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .catch(() => {})
    .then(() => self.clients.claim())
));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)).catch(() => {}); return r; })
      .catch(() => caches.match(e.request))
  );
});
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "Daily Plan", body: e.data ? e.data.text() : "" }; }
  const tag = d.tag || "dp";
  const block = tag.indexOf("dp-") === 0 ? tag.slice(3) : "";
  const opts = { body: d.body || "", tag: tag, icon: "icon-192.png", badge: "icon-192.png", data: { block: block }, requireInteraction: false };
  e.waitUntil(self.registration.showNotification(d.title || "Daily Plan", opts));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const block = (e.notification.data && e.notification.data.block) || "";
  const target = block ? "./?b=" + block : "./";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.indexOf(self.registration.scope) !== 0) continue;
        if ("navigate" in c) {
          return c.navigate(target).then((w) => (w || c).focus()).catch(() => self.clients.openWindow(target));
        }
        return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
