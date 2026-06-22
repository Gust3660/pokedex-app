const APP_CACHE = "pokedex-app-v1";
const DATA_CACHE = "pokedex-data-v1";
const CURRENT_CACHES = new Set([APP_CACHE, DATA_CACHE]);

const canCache = (response) => response.ok || response.type === "opaque";

const cacheBuildAssets = async () => {
  const cache = await caches.open(APP_CACHE);
  const appUrl = new URL("./", self.registration.scope);
  const response = await fetch(appUrl, { cache: "reload" });

  if (!response.ok) throw new Error("No se pudo guardar la aplicación");

  await cache.put(appUrl, response.clone());
  const html = await response.text();
  const assetUrls = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map(([, path]) => new URL(path, appUrl))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => url.href);

  await Promise.allSettled(
    [...new Set(assetUrls)].map((url) => cache.add(url)),
  );
};

const fetchAndCache = async (request, cacheName) => {
  try {
    const response = await fetch(request);

    if (canCache(response)) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(cacheBuildAssets().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !CURRENT_CACHES.has(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetchAndCache(request, APP_CACHE).catch(() =>
        caches.match(new URL("./", self.registration.scope)),
      ),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetchAndCache(request, APP_CACHE),
      ),
    );
    return;
  }

  event.respondWith(fetchAndCache(request, DATA_CACHE));
});
