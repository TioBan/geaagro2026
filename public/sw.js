const CACHE_NAME = 'geaagro-cache-v14';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
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

// Install Service Worker and cache essential shell assets resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Pre-caching offline assets...');
      // Use individual caching so one missing asset never stops the rest
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[Service Worker] Skipping cache for asset:', url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate & Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch events: Cache-First for static image assets, Network-First for dynamic routes
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
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

  const isImage = /\.(jpg|jpeg|png|svg|webp|gif|ico)$/i.test(url.pathname);

  if (isImage) {
    // Cache First strategy for images to guarantee offline instant loading
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return empty response or let img error handler take over
            return new Response('', { status: 404, statusText: 'Not Found' });
          });
      })
    );
    return;
  }

  // Network First for HTML and dynamic scripts with fallback to Cache
  event.respondWith(
    fetch(event.request)
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
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
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

// Message listener from React Application (Direct SW notification dispatch)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || 'GeaAgro Alerta', options || {
      body: 'Atualização do sistema agronômico.',
      icon: '/favicon.svg'
    });
  }
});

