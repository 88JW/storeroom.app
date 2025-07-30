// 🚀 Storeroom App - Service Worker
// Progressive Web App functionality

const CACHE_NAME = 'storeroom-v2';
const STATIC_CACHE_NAME = 'storeroom-static-v2';
const DYNAMIC_CACHE_NAME = 'storeroom-dynamic-v2';

// 📦 Pliki do cache'owania statycznego
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Vite generuje te pliki dynamicznie, więc dodamy je w runtime
];

// 🌐 API endpoints do cache'owania dynamicznego
const API_CACHE_PATTERNS = [
  /^https:\/\/world\.openfoodfacts\.org\/api/,
  /^https:\/\/world\.openbeautyfacts\.org\/api/,
  /^https:\/\/world\.openproductsfacts\.org\/api/,
  /^https:\/\/api\.barcodelookup\.com/
];

// 📱 Instalacja Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 SW: Instalacja service worker-a');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 SW: Cache statyczny otwarty');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ SW: Pliki statyczne dodane do cache');
        return self.skipWaiting(); // Aktywuj nowego SW od razu
      })
      .catch((error) => {
        console.error('❌ SW: Błąd podczas instalacji:', error);
      })
  );
});

// 🔄 Aktywacja Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 SW: Aktywacja service worker-a');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Usuń stare cache'e
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('storeroom-')) {
              console.log('🗑️ SW: Usuwanie starego cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ SW: Service worker aktywowany');
        return self.clients.claim(); // Przejmij kontrolę nad wszystkimi klientami
      })
      .catch((error) => {
        console.error('❌ SW: Błąd podczas aktywacji:', error);
      })
  );
});

// 🌐 Przechwytywanie requestów - Cache First Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Tylko dla GET requestów
  if (request.method !== 'GET') {
    return;
  }
  
  // Firebase requests - zawsze przez sieć (dla realtime data)
  if (url.hostname.includes('firebase') || url.hostname.includes('firestore')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

// 🛠️ Główna logika obsługi requestów
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 1. Statyczne pliki aplikacji - Cache First
    if (url.origin === self.location.origin) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // 2. API zewnętrzne (barcode APIs) - Network First z fallback
    if (isApiRequest(url)) {
      return await networkFirstWithCache(request, DYNAMIC_CACHE_NAME);
    }
    
    // 3. Inne requesty - Network First
    return await fetch(request);
    
  } catch (error) {
    console.error('❌ SW: Błąd obsługi request:', error);
    
    // Fallback do offline page dla nawigacji
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// 🎯 Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('📦 SW: Cache hit:', request.url);
    return cached;
  }
  
  console.log('🌐 SW: Cache miss, fetching:', request.url);
  const response = await fetch(request);
  
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// 🌐 Network First with Cache Fallback
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('🌐 SW: Network first:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful API responses
      cache.put(request, response.clone());
      console.log('💾 SW: API response cached:', request.url);
    }
    
    return response;
    
  } catch (error) {
    console.log('📦 SW: Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('✅ SW: Cache fallback success:', request.url);
      return cached;
    }
    
    throw error;
  }
}

// 🔍 Sprawdź czy to request do API
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

// 📱 Background Sync - dla offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'product-sync') {
    event.waitUntil(syncProducts());
  }
});

// 🔄 Synchronizacja produktów po powrocie online
async function syncProducts() {
  try {
    console.log('🔄 SW: Synchronizacja produktów...');
    
    // Tutaj możemy dodać logikę synchronizacji offline changes
    // Na razie tylko logujemy
    console.log('✅ SW: Synchronizacja zakończona');
    
  } catch (error) {
    console.error('❌ SW: Błąd synchronizacji:', error);
  }
}

// 🔔 Push Notifications (przygotowanie na przyszłość)
self.addEventListener('push', (event) => {
  console.log('🔔 SW: Push notification received');
  
  const options = {
    body: 'Masz produkty, które wkrótce wygasną!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Zobacz produkty',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Zamknij'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Storeroom App', options)
  );
});

// 🎯 Obsługa kliknięć w notyfikacje
self.addEventListener('notificationclick', (event) => {
  console.log('🎯 SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/lista?filter=expiring')
    );
  }
});

console.log('🚀 SW: Service Worker załadowany');
