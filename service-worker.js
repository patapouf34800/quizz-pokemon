// Service Worker pour le Quiz Pokémon
// Version du cache - incrémenter pour forcer une mise à jour
const CACHE_VERSION = 'pokemon-quiz-v1.0.0';
const CACHE_NAME = `pokemon-quiz-cache-${CACHE_VERSION}`;

// Liste de TOUS les fichiers à mettre en cache
const FILES_TO_CACHE = [
    './',
    './index.html',
    './pokemon-quiz-enfants.html',
    './pokemon-database.js',
    './manifest.json',
    
    // Images des badges (à compléter avec tous tes badges)
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
    console.log('[ServiceWorker] Installation...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Mise en cache des fichiers');
                // On met en cache les fichiers essentiels
                return cache.addAll(FILES_TO_CACHE.filter(file => {
                    // On ne met en cache que les fichiers HTML, JS, manifest et badges
                    return !file.includes('pokemon-music') && 
                           !file.includes('pokemon-cries') && 
                           !file.includes('pokemon-images');
                }));
            })
            .then(() => {
                console.log('[ServiceWorker] Fichiers mis en cache avec succès');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Erreur lors de la mise en cache:', error);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activation...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Supprimer les anciens caches
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] Service Worker activé');
            return self.clients.claim();
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Stratégie : Cache First pour les fichiers statiques
    // Network First pour les musiques/cris/images (gros fichiers)
    
    if (url.pathname.includes('pokemon-music') || 
        url.pathname.includes('pokemon-cries') || 
        url.pathname.includes('pokemon-images')) {
        // Network First pour les gros fichiers
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cloner la réponse pour la mettre en cache
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Si le réseau échoue, essayer le cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Cache First pour les fichiers essentiels
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Retourner depuis le cache si disponible
                    if (response) {
                        return response;
                    }
                    
                    // Sinon, fetch depuis le réseau
                    return fetch(event.request)
                        .then((response) => {
                            // Vérifier si la réponse est valide
                            if (!response || response.status !== 200 || response.type === 'error') {
                                return response;
                            }
                            
                            // Cloner la réponse pour la mettre en cache
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                            
                            return response;
                        })
                        .catch((error) => {
                            console.error('[ServiceWorker] Erreur fetch:', error);
                            // Retourner une page d'erreur personnalisée si nécessaire
                            return new Response('Contenu non disponible hors ligne', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: new Headers({
                                    'Content-Type': 'text/plain'
                                })
                            });
                        });
                })
        );
    }
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[ServiceWorker] Service Worker chargé');
