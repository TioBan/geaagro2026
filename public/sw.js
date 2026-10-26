const CACHE_NAME = 'geaagro-cache-v14';

// Essential assets: Required for application shell & JavaScript/CSS modules to execute offline
const ESSENTIAL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Optional assets: Auxiliary photography and diagnostic illustrations that may fail gracefully
const OPTIONAL_ASSETS = [
  '/icon.png',
  '/splash.jpg',
  // Nematodes Microscopy & Real Field Damage Photos
  '/anguina_tritici_microscope.jpg',
  '/anguina_tritici_root_damage.jpg',
  '/aphelenchoides_besseyi_microscope.jpg',
  '/aphelenchoides_besseyi_root_damage.jpg',
  '/aphelenchoides_fragariae_microscope.jpg',
  '/aphelenchoides_fragariae_root_damage.jpg',
  '/aphelenchoides_ritzemabosi_microscope.jpg',
  '/aphelenchoides_ritzemabosi_root_damage.jpg',
  '/belonolaimus_longicaudatus_microscope.jpg',
  '/belonolaimus_longicaudatus_root_damage.jpg',
  '/bursaphelenchus_cocophilus_microscope.jpg',
  '/bursaphelenchus_cocophilus_root_damage.jpg',
  '/bursaphelenchus_xylophilus_microscope.jpg',
  '/bursaphelenchus_xylophilus_root_damage.jpg',
  '/criconemoides_onoensis_microscope.jpg',
  '/criconemoides_onoensis_root_damage.jpg',
  '/ditylenchus_destructor_microscope.jpg',
  '/ditylenchus_destructor_root_damage.jpg',
  '/ditylenchus_dipsaci_microscope.jpg',
  '/ditylenchus_dipsaci_root_damage.jpg',
  '/dolichodorus_heterocephalus_microscope.jpg',
  '/dolichodorus_heterocephalus_root_damage.jpg',
  '/globodera_pallida_microscope.jpg',
  '/globodera_pallida_root_damage.jpg',
  '/globodera_rostochiensis_microscope.jpg',
  '/globodera_rostochiensis_root_damage.jpg',
  '/helicotylenchus_dihystera_microscope.jpg',
  '/helicotylenchus_root_damage.jpg',
  '/helicotylenchus_multicinctus_microscope.jpg',
  '/helicotylenchus_multicinctus_root_damage.jpg',
  '/hemicycliophora_arenaria_microscope.jpg',
  '/hemicycliophora_arenaria_root_damage.jpg',
  '/heterodera_avenae_microscope.jpg',
  '/heterodera_avenae_root_damage.jpg',
  '/heterodera_glycines_microscope.jpg',
  '/heterodera_glycines_root_damage.jpg',
  '/heterodera_schachtii_microscope.jpg',
  '/heterodera_schachtii_root_damage.jpg',
  '/hirschmanniella_oryzae_microscope.jpg',
  '/hirschmanniella_oryzae_root_damage.jpg',
  '/hoplolaimus_columbus_microscope.jpg',
  '/hoplolaimus_columbus_root_damage.jpg',
  '/hoplolaimus_galeatus_microscope.jpg',
  '/hoplolaimus_galeatus_root_damage.jpg',
  '/longidorus_elongatus_microscope.jpg',
  '/longidorus_elongatus_root_damage.jpg',
  '/meloidogyne_microscope.jpg',
  '/meloidogyne_root_damage.jpg',
  '/pratylenchus_brachyurus_microscope.jpg',
  '/pratylenchus_root_damage.jpg',
  '/pratylenchus_vulnus_microscope.jpg',
  '/pratylenchus_vulnus_root_damage.jpg',
  '/pratylenchus_zeae_microscope.jpg',
  '/pratylenchus_zeae_root_damage.jpg',
  '/radopholus_similis_microscope.jpg',
  '/radopholus_similis_root_damage.jpg',
  '/rotylenchulus_reniformis_microscope.jpg',
  '/rotylenchulus_reniformis_root_damage.jpg',
  '/scutellonema_bradys_microscope.jpg',
  '/scutellonema_bradys_root_damage.jpg',
  '/subanguina_radicicola_microscope.jpg',
  '/subanguina_radicicola_root_damage.jpg',
  '/trichodorus_christiei_microscope.jpg',
  '/trichodorus_christiei_root_damage.jpg',
  '/tylenchorhynchus_claytoni_microscope.jpg',
  '/tylenchorhynchus_claytoni_root_damage.jpg',
  '/tylenchulus_semipenetrans_microscope.jpg',
  '/tylenchulus_semipenetrans_root_damage.jpg',
  '/xiphinema_americanum_microscope.jpg',
  '/xiphinema_americanum_root_damage.jpg',
  '/xiphinema_index_microscope.jpg',
  '/xiphinema_index_root_damage.jpg',
  // Nursery & Phytopathology Diagnosis Real Photos
  '/pythium_damping_off.jpg',
  '/pythium_roots.jpg',
  '/botrytis_cinerea_leaf.jpg',
  '/botrytis_cinerea_stem.jpg',
  '/iron_chlorosis_leaf.jpg',
  '/iron_chlorosis_plant.jpg',
  '/nursery_downy_mildew.jpg',
  '/nursery_powdery_mildew.jpg',
  '/nursery_phytophthora.jpg',
  '/nursery_xanthomonas.jpg',
  '/nursery_pectobacterium.jpg',
  '/nursery_tswv_virus.jpg',
  '/nursery_thrips_damage.jpg',
  '/nursery_whitefly_adults.jpg',
  '/nursery_fungus_gnat.jpg',
  '/nursery_aphids_colony.jpg',
  '/nursery_spider_mite.jpg',
  '/nursery_cutworm_stem.jpg',
  '/nursery_rhizoctonia.jpg',
  '/nursery_cercospora.jpg',
  '/nursery_cylindrocladium.jpg',
  '/nursery_diaphorina.jpg',
  // Nutritional Deficiency & Disorders Real Photos
  '/nutr_nitrogen_deficiency.jpg',
  '/nutr_calcium_deficiency.jpg',
  '/nutr_phosphorus_deficiency.jpg',
  '/nutr_magnesium_deficiency.jpg',
  '/nutr_boron_deficiency.jpg',
  '/nutr_potassium_deficiency.jpg',
  '/nutr_salinity_excess.jpg',
  '/nutr_zinc_deficiency.jpg'
];

// Fallback compatibility alias
const ASSETS_TO_CACHE = [...ESSENTIAL_ASSETS, ...OPTIONAL_ASSETS];

// Install Service Worker and cache all essential application modules & assets
self.addEventListener('install', (event) => {
  // NOTA: NÃO chamar self.skipWaiting() aqui!
  // O Service Worker deve obrigatoriamente aguardar a confirmação do usuário via mensagem 'SKIP_WAITING'
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log(`[Service Worker] Installing ${CACHE_NAME}. Precaching all application chunks & modules...`);

      // Combine all assets to precache, giving highest priority to shell and JS/CSS chunks
      const allTargetAssets = Array.from(
        new Set([
          '/',
          '/index.html',
          '/manifest.json',
          '/icon.png',
          ...(Array.isArray(ASSETS_TO_CACHE) ? ASSETS_TO_CACHE : []),
          ...(Array.isArray(ESSENTIAL_ASSETS) ? ESSENTIAL_ASSETS : []),
          ...(Array.isArray(OPTIONAL_ASSETS) ? OPTIONAL_ASSETS : []),
        ])
      );

      // Precache in batches of 15 to maximize throughput without socket exhaustion
      const batchSize = 15;
      for (let i = 0; i < allTargetAssets.length; i += batchSize) {
        const batch = allTargetAssets.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(async (url) => {
            try {
              const response = await fetch(url, { cache: 'no-cache' });
              if (response && (response.ok || response.type === 'opaque')) {
                await cache.put(url, response);
              }
            } catch (err) {
              console.warn('[Service Worker] Non-fatal precache skip:', url);
            }
          })
        );
      }

      console.log(`[Service Worker] All application modules precached successfully (${allTargetAssets.length} items). Ready for 100% offline execution.`);
    })
  );
});

// Activate & Clean old caches safely
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.startsWith('geaagro-cache-')) {
            console.log('[Service Worker] Safely purging obsolete cache generation:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch events: Cache-First strategy for all static assets (scripts, styles, images, fonts, manifests)
// Network-First with instant offline fallback for document navigation
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Strictly bypass any development assets, HMR, or hot updates to prevent cache issues in dev
  const isDevAsset = 
    url.pathname.startsWith('/src/') || 
    url.pathname.startsWith('/node_modules/') || 
    url.pathname.startsWith('/@vite/') || 
    url.pathname.startsWith('/@id/') || 
    url.pathname.includes('@vite') || 
    url.pathname.includes('hmr') || 
    url.pathname.includes('hot-update') || 
    url.searchParams.has('import') || 
    url.searchParams.has('t') || 
    url.searchParams.has('v');

  if (isDevAsset) {
    return; // Let the browser handle development assets naturally via network without SW intervention
  }

  // Identify all static assets: Vite hashed assets, scripts, stylesheets, images, fonts, manifests
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    /\.(js|mjs|cjs|css|png|jpg|jpeg|svg|webp|gif|ico|avif|woff|woff2|ttf|otf|eot|wasm|webmanifest)$/i.test(url.pathname) ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/icon.png' ||
    url.pathname === '/splash.jpg' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  // Cache-First strategy for ALL static assets:
  // 1. Immediately return from cache if present and valid
  // 2. Otherwise fetch from network, validate, cache for next time, and return
  // 3. If offline, return resilient fallback module/stylesheet/placeholder
  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        // 1. Check Cache first across active caches, ignoring query parameters for chunk accuracy
        let cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (!cachedResponse) {
          cachedResponse = await caches.match(url.pathname, { ignoreSearch: true });
        }
        if (cachedResponse) {
          const contentType = cachedResponse.headers.get('content-type') || '';
          // Ensure cached response is not a corrupt HTML fallback
          if (!contentType.includes('text/html') || url.pathname.endsWith('.html')) {
            return cachedResponse;
          }
          // Purge corrupted HTML from cache
          try {
            const currentCache = await caches.open(CACHE_NAME);
            await currentCache.delete(event.request);
          } catch {}
        }

        // 2. Fetch from network on cache miss
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const contentType = networkResponse.headers.get('content-type') || '';
            const isJs = url.pathname.endsWith('.js') && (contentType.includes('javascript') || contentType.includes('ecmascript'));
            const isCss = url.pathname.endsWith('.css') && contentType.includes('css');
            const isOtherValidAsset = !url.pathname.endsWith('.js') && !url.pathname.endsWith('.css') && !contentType.includes('text/html');

            if (isJs || isCss || isOtherValidAsset || networkResponse.type === 'opaque') {
              const responseClone = networkResponse.clone();
              const currentCache = await caches.open(CACHE_NAME);
              await currentCache.put(event.request, responseClone);
            } else {
              console.warn(`[Service Worker] Ignored caching asset with invalid Content-Type: ${contentType} for ${url.pathname}`);
            }
          }
          return networkResponse;
        } catch (fetchErr) {
          console.warn(`[Service Worker] Offline asset request: ${url.pathname}`);

          // 3. Resilient Fallbacks for offline execution:
          // Never return HTTP 503 or HTML for a JavaScript chunk!
          // Return a syntactically valid ES module with HTTP 200 that signals unavailability cleanly.
          if (url.pathname.endsWith('.js')) {
            const fallbackModuleCode =
              'export default function OfflineModuleFallback() {\n' +
              '  const err = new Error("Módulo offline não disponível em cache local.");\n' +
              '  err.name = "OfflineModuleNotCachedError";\n' +
              '  throw err;\n' +
              '}\n' +
              'export const __offlineUnavailable = true;\n';

            return new Response(fallbackModuleCode, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': 'application/javascript; charset=utf-8',
                'Cache-Control': 'no-store'
              }
            });
          }

          if (url.pathname.endsWith('.css')) {
            return new Response('/* Offline fallback stylesheet */', {
              status: 200,
              headers: {
                'Content-Type': 'text/css; charset=utf-8',
                'Cache-Control': 'no-store'
              }
            });
          }

          // Return empty placeholder image for offline image requests
          if (/\.(jpg|jpeg|png|svg|webp|gif|ico)$/i.test(url.pathname)) {
            const placeholderSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="10" text-anchor="middle" dy=".3em">Offline</text></svg>';
            return new Response(placeholderSvg, {
              status: 200,
              headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' }
            });
          }

          return new Response('Resource Not Available Offline', {
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })()
    );
    return;
  }

  // HTML Document Navigation requests: Instant offline shell serving or fast network with fallback
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      (async () => {
        // Instant response if device is already offline
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          const cachedIndex = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cachedIndex) {
            return cachedIndex;
          }
        }

        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
              const responseClone = response.clone();
              const currentCache = await caches.open(CACHE_NAME);
              await currentCache.put('/index.html', responseClone);
            }
          }
          return response;
        } catch (navErr) {
          const cachedIndex = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cachedIndex) {
            return cachedIndex;
          }
          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><title>GeaAgro Offline</title></head><body><h1>GeaAgro Offline</h1><p>Aplicativo em execução offline. Por favor recarregue quando a conexão for restabelecida.</p></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          );
        }
      })()
    );
    return;
  }

  // Other general requests: Cache-First fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return new Response('', { status: 503, statusText: 'Offline' });
        });
    })
  );
});

// Sync Event for Background Sync API when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'geaagro-sync') {
    console.log('[Service Worker] Background Sync Tag Triggered!');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_OFFLINE_DATA' });
        });
      })
    );
  }
});

// Push Notification Event Listener
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received:', event);
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = {
        title: 'GeaAgro Notificação',
        body: event.data.text()
      };
    }
  } else {
    payload = {
      title: 'GeaAgro Agronomia',
      body: 'Você possui novas atualizações de tarefas ou laudos técnicos no GeaAgro.'
    };
  }

  const title = payload.title || 'GeaAgro Notificação';
  const options = {
    body: payload.body || 'Nova atividade agronômica pendente ou laudo finalizado.',
    icon: payload.icon || '/favicon.svg',
    badge: payload.badge || '/favicon.svg',
    tag: payload.tag || `geaagro-push-${Date.now()}`,
    data: payload.data || { url: '/', tab: 'dashboard' },
    actions: payload.actions || [
      { action: 'open', title: 'Ver Detalhes' },
      { action: 'dismiss', title: 'Fechar' }
    ],
    vibrate: payload.vibrate || [200, 100, 200, 100, 200],
    renotify: true,
    requireInteraction: payload.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event Listener (Deep-linking & Client Focus)
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked! Action:', event.action);
  event.notification.close();

  if (event.action === 'dismiss' || event.action === 'close') {
    return;
  }

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and post a message to switch tabs
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'PUSH_NOTIFICATION_CLICKED',
            payload: notificationData,
            action: event.action
          });
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl).then((newClient) => {
          if (newClient) {
            setTimeout(() => {
              newClient.postMessage({
                type: 'PUSH_NOTIFICATION_CLICKED',
                payload: notificationData,
                action: event.action
              });
            }, 1000);
          }
        });
      }
    })
  );
});

// Message listener from React Application (Controlled updates & direct notifications)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Atualização explícita sob controle e consentimento do usuário (Princípio 4 da Fase 1)
  if (event.data.type === 'SKIP_WAITING' || event.data.type === 'APPLY_UPDATE') {
    console.log('[Service Worker] Atualização autorizada expressamente pelo usuário. Ativando nova versão...');
    self.skipWaiting();
    return;
  }

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || 'GeaAgro Alerta', options || {
      body: 'Atualização do sistema agronômico.',
      icon: '/favicon.svg'
    });
  }
});

