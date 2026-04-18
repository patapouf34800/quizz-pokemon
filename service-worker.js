// Service Worker pour le Quiz Pokémon
// Version du cache - incrémenter pour forcer une mise à jour
const CACHE_VERSION = 'pokemon-quiz-v1.1.0';
const CACHE_NAME = `pokemon-quiz-cache-${CACHE_VERSION}`;

// Caches séparés pour différents types de ressources
const STATIC_CACHE = `${CACHE_NAME}-static`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const AUDIO_CACHE = `${CACHE_NAME}-audio`;
const BADGE_CACHE = `${CACHE_NAME}-badges`;

// Fichiers essentiels à mettre en cache immédiatement
const ESSENTIAL_FILES = [
    './',
    './index.html',
    './manifest.json'
];

// Liste des badges à mettre en cache
const BADGE_FILES = [
    './pokemon-badges/eau.png',
    './pokemon-badges/normal.png',
    './pokemon-badges/vol.png',
    './pokemon-badges/plante.png',
    './pokemon-badges/psy.png',
    './pokemon-badges/insecte.png',
    './pokemon-badges/sol.png',
    './pokemon-badges/poison.png',
    './pokemon-badges/feu.png',
    './pokemon-badges/roche.png',
    './pokemon-badges/combat.png',
    './pokemon-badges/électrik.png',
    './pokemon-badges/ténèbres.png',
    './pokemon-badges/acier.png',
    './pokemon-badges/dragon.png',
    './pokemon-badges/glace.png',
    './pokemon-badges/spectre.png',
    './pokemon-badges/fée.png',
    './pokemon-badges/starter.png',
    './pokemon-badges/évoli.png',
    './pokemon-badges/fossile.png',
    './pokemon-badges/bébé.png',
    './pokemon-badges/fabuleux.png',
    './pokemon-badges/légendaire.png',
    './pokemon-badges/sacha.png',
    './pokemon-badges/ondine.png',
    './pokemon-badges/pierre.png',
    './pokemon-badges/jessie.png',
    './pokemon-badges/james.png',
    './pokemon-badges/rival.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installation en cours...');
    
    event.waitUntil(
        Promise.all([
            // Cache des fichiers essentiels
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[ServiceWorker] Mise en cache des fichiers essentiels');
                return cache.addAll(ESSENTIAL_FILES);
            }),
            // Cache des badges
            caches.open(BADGE_CACHE).then(cache => {
                console.log('[ServiceWorker] Mise en cache des badges');
                return cache.addAll(BADGE_FILES).catch(err => {
                    console.warn('[ServiceWorker] Certains badges n\'ont pas pu être mis en cache:', err);
                    // On continue même si certains badges ne sont pas disponibles
                    return Promise.resolve();
                });
            })
        ]).then(() => {
            console.log('[ServiceWorker] Installation réussie');
            return self.skipWaiting();
        }).catch(error => {
            console.error('[ServiceWorker] Erreur lors de l\'installation:', error);
        })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activation en cours...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Supprimer les anciens caches qui ne correspondent pas à la version actuelle
                    if (!cacheName.includes(CACHE_VERSION)) {
                        console.log('[ServiceWorker] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] Activation réussie');
            return self.clients.claim();
        })
    );
});

// Stratégie de cache intelligente
function getCacheStrategy(url) {
    const pathname = new URL(url).pathname;
    
    // Images Pokémon : Network First avec cache fallback
    if (pathname.includes('pokemon-images/')) {
        return {
            cache: IMAGE_CACHE,
            strategy: 'network-first',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
        };
    }
    
    // Musiques : Network First avec cache fallback
    if (pathname.includes('pokemon-music/')) {
        return {
            cache: AUDIO_CACHE,
            strategy: 'network-first',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
        };
    }
    
    // Cris : Network First avec cache fallback
    if (pathname.includes('pokemon-cries/')) {
        return {
            cache: AUDIO_CACHE,
            strategy: 'network-first',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
        };
    }
    
    // Badges : Cache First (déjà mis en cache à l'installation)
    if (pathname.includes('pokemon-badges/')) {
        return {
            cache: BADGE_CACHE,
            strategy: 'cache-first',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 an
        };
    }
    
    // Fichiers statiques : Cache First
    if (pathname.match(/\.(html|js|css|json)$/)) {
        return {
            cache: STATIC_CACHE,
            strategy: 'cache-first',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        };
    }
    
    // Par défaut : Network First
    return {
        cache: STATIC_CACHE,
        strategy: 'network-first',
        maxAge: 24 * 60 * 60 * 1000 // 1 jour
    };
}

// Stratégie Network First
async function networkFirst(request, cacheName, maxAge) {
    try {
        const response = await fetch(request);
        
        if (response && response.status === 200) {
            const cache = await caches.open(cacheName);
            // Cloner la réponse car elle ne peut être consommée qu'une fois
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.log('[ServiceWorker] Réseau indisponible, utilisation du cache pour:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Si pas de cache, retourner une réponse d'erreur
        return new Response('Contenu non disponible hors ligne', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain; charset=UTF-8'
            })
        });
    }
}

// Stratégie Cache First
async function cacheFirst(request, cacheName, maxAge) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Vérifier l'âge du cache
        const dateHeader = cachedResponse.headers.get('date');
        const cachedDate = dateHeader ? new Date(dateHeader).getTime() : 0;
        const now = new Date().getTime();
        
        // Si le cache est trop vieux, essayer de le mettre à jour en arrière-plan
        if (now - cachedDate > maxAge) {
            fetch(request).then(response => {
                if (response && response.status === 200) {
                    caches.open(cacheName).then(cache => {
                        cache.put(request, response);
                    });
                }
            }).catch(() => {
                // Échec silencieux, on garde le cache existant
            });
        }
        
        return cachedResponse;
    }
    
    // Si pas en cache, essayer le réseau
    try {
        const response = await fetch(request);
        
        if (response && response.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        return new Response('Contenu non disponible', {
            status: 404,
            statusText: 'Not Found',
            headers: new Headers({
                'Content-Type': 'text/plain; charset=UTF-8'
            })
        });
    }
}

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-HTTP
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    const { cache, strategy, maxAge } = getCacheStrategy(event.request.url);
    
    if (strategy === 'network-first') {
        event.respondWith(networkFirst(event.request, cache, maxAge));
    } else {
        event.respondWith(cacheFirst(event.request, cache, maxAge));
    }
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Message pour vider le cache
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                return self.clients.matchAll();
            }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'CACHE_CLEARED',
                        message: 'Cache vidé avec succès'
                    });
                });
            })
        );
    }
    
    // Message pour obtenir le statut du cache
    if (event.data && event.data.type === 'GET_CACHE_STATUS') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(async (cacheName) => {
                        const cache = await caches.open(cacheName);
                        const keys = await cache.keys();
                        return {
                            name: cacheName,
                            size: keys.length
                        };
                    })
                );
            }).then(cacheStatus => {
                return self.clients.matchAll();
            }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'CACHE_STATUS',
                        caches: cacheStatus
                    });
                });
            })
        );
    }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
    console.error('[ServiceWorker] Erreur:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[ServiceWorker] Promise rejetée:', event.reason);
});

console.log('[ServiceWorker] Service Worker chargé - Version', CACHE_VERSION);
