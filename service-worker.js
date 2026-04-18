// Service Worker pour le Quiz Pokémon
// Version du cache - incrémenter pour forcer une mise à jour
const CACHE_VERSION = 'pokemon-quiz-v1.2.0';
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

// Nombre total de Pokémon (1-649)
const TOTAL_POKEMON = 649;

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
                    return Promise.resolve();
                });
            })
        ]).then(() => {
            console.log('[ServiceWorker] Installation réussie - Fichiers essentiels en cache');
            console.log('[ServiceWorker] Le pré-chargement des Pokémon démarrera après activation');
            return self.skipWaiting();
        }).catch(error => {
            console.error('[ServiceWorker] Erreur lors de l\'installation:', error);
        })
    );
});

// Fonction pour pré-charger tous les Pokémon en arrière-plan
async function preloadAllPokemon() {
    console.log('[ServiceWorker] 🎮 Début du pré-chargement de tous les Pokémon...');
    
    const imageCache = await caches.open(IMAGE_CACHE);
    const audioCache = await caches.open(AUDIO_CACHE);
    
    let imagesLoaded = 0;
    let criesLoaded = 0;
    let imagesFailed = 0;
    let criesFailed = 0;
    
    // Notifier le début
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'PRELOAD_PROGRESS',
            current: 0,
            total: TOTAL_POKEMON * 2 // images + cris
        });
    });
    
    // Pré-charger par lots de 10 pour ne pas surcharger
    const batchSize = 10;
    
    for (let i = 1; i <= TOTAL_POKEMON; i += batchSize) {
        const batch = [];
        
        for (let num = i; num < i + batchSize && num <= TOTAL_POKEMON; num++) {
            // Charger l'image
            const imagePromise = fetch(`./pokemon-images/${num}.png`)
                .then(response => {
                    if (response.ok) {
                        imageCache.put(`./pokemon-images/${num}.png`, response.clone());
                        imagesLoaded++;
                        return true;
                    }
                    imagesFailed++;
                    return false;
                })
                .catch(() => {
                    imagesFailed++;
                    return false;
                });
            
            // Charger le cri (format .ogg, pas .mp3)
            const cryPromise = fetch(`./pokemon-cries/${num}.ogg`)
                .then(response => {
                    if (response.ok) {
                        audioCache.put(`./pokemon-cries/${num}.ogg`, response.clone());
                        criesLoaded++;
                        return true;
                    }
                    criesFailed++;
                    return false;
                })
                .catch(() => {
                    criesFailed++;
                    return false;
                });
            
            batch.push(imagePromise, cryPromise);
        }
        
        // Attendre que le lot soit terminé avant de passer au suivant
        await Promise.all(batch);
        
        // Envoyer la progression tous les lots
        const currentProgress = imagesLoaded + criesLoaded;
        const clientsProgress = await self.clients.matchAll();
        clientsProgress.forEach(client => {
            client.postMessage({
                type: 'PRELOAD_PROGRESS',
                current: currentProgress,
                total: TOTAL_POKEMON * 2
            });
        });
        
        // Log de progression tous les 50 Pokémon
        if (i % 50 === 1) {
            console.log(`[ServiceWorker] 📊 Progression: ${imagesLoaded} images, ${criesLoaded} cris en cache`);
        }
        
        // Petite pause pour ne pas bloquer le navigateur
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('[ServiceWorker] ✅ Pré-chargement des Pokémon terminé !');
    console.log(`[ServiceWorker] 📸 Images: ${imagesLoaded} chargées, ${imagesFailed} échecs`);
    console.log(`[ServiceWorker] 🔊 Cris: ${criesLoaded} chargés, ${criesFailed} échecs`);
    
    // Pré-charger les musiques de fond (gen1.mp3 à gen5.mp3)
    console.log('[ServiceWorker] 🎵 Pré-chargement des musiques...');
    let musicLoaded = 0;
    let musicFailed = 0;
    
    for (let gen = 1; gen <= 5; gen++) {
        try {
            const response = await fetch(`./pokemon-music/gen${gen}.mp3`);
            if (response.ok) {
                await audioCache.put(`./pokemon-music/gen${gen}.mp3`, response);
                musicLoaded++;
                console.log(`[ServiceWorker] ✅ Musique gen${gen} chargée`);
            } else {
                musicFailed++;
            }
        } catch (error) {
            musicFailed++;
            console.warn(`[ServiceWorker] ⚠️ Échec musique gen${gen}`);
        }
    }
    
    console.log(`[ServiceWorker] 🎵 Musiques: ${musicLoaded} chargées, ${musicFailed} échecs`);
    
    // Notifier les clients que le pré-chargement est terminé
    const clientsFinal = await self.clients.matchAll();
    clientsFinal.forEach(client => {
        client.postMessage({
            type: 'PRELOAD_COMPLETE',
            stats: {
                imagesLoaded,
                imagesFailed,
                criesLoaded,
                criesFailed,
                musicLoaded,
                musicFailed
            }
        });
    });
}

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
        }).then(() => {
            // Lancer le pré-chargement en arrière-plan APRÈS l'activation
            console.log('[ServiceWorker] 🚀 Démarrage du pré-chargement des Pokémon...');
            preloadAllPokemon(); // Ne pas attendre - se fait en arrière-plan
        })
    );
});

// Stratégie de cache intelligente
function getCacheStrategy(url) {
    const pathname = new URL(url).pathname;
    
    // Images Pokémon : Cache First (on les a toutes maintenant!)
    if (pathname.includes('pokemon-images/')) {
        return {
            cache: IMAGE_CACHE,
            strategy: 'cache-first',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 an
        };
    }
    
    // Cris : Cache First (on les a tous maintenant!)
    if (pathname.includes('pokemon-cries/')) {
        return {
            cache: AUDIO_CACHE,
            strategy: 'cache-first',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 an
        };
    }
    
    // Musiques : Network First (optionnel, pas pré-chargé)
    if (pathname.includes('pokemon-music/')) {
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
