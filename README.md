# 🎮 Quiz Pokémon pour Enfants

Application web interactive pour apprendre à reconnaître les 649 Pokémon de la Génération 1 à 5 !

## ✨ Fonctionnalités

- **649 Pokémon** à découvrir (Gen 1 à 5)
- **30 badges** à collectionner :
  - 18 badges Captures (par type)
  - 6 badges Spéciaux (Starter, Évoli, Fossile, Bébé, Fabuleux, Légendaire)
  - 6 badges Dresseurs (Sacha, Ondine, Pierre, Jessie, James, Rival)
- **Pokédex interactif** avec recherche et filtres
- **Statistiques** de progression
- **Multi-joueurs** (plusieurs profils)
- **Musiques** des jeux Pokémon
- **Cris** des Pokémon
- **Export/Import** des sauvegardes
- **PWA** : Fonctionne hors ligne et installable !

## 🚀 Utilisation sur GitHub Pages

### 1. Créer un repository GitHub

1. Va sur [GitHub](https://github.com)
2. Clique sur "New repository"
3. Nomme-le `pokemon-quiz` (ou autre nom)
4. Choisis "Public" pour partager avec tes amis
5. Clique sur "Create repository"

### 2. Uploader les fichiers

**Structure des fichiers à uploader :**

```
pokemon-quiz/
├── index.html                    ← Page d'accueil
├── pokemon-quiz-enfants.html     ← Le jeu
├── pokemon-database.js           ← Base de données
├── service-worker.js             ← Service Worker pour PWA
├── manifest.json                 ← Manifest PWA
├── icon-192.png                  ← Icône 192x192 (à créer)
├── icon-512.png                  ← Icône 512x512 (à créer)
├── pokemon-badges/               ← Dossier avec tous les badges
│   ├── eau.png
│   ├── feu.png
│   ├── ... (tous les badges)
├── pokemon-music/                ← Dossier musiques (optionnel)
│   ├── gen1.mp3
│   ├── gen2.mp3
│   └── ...
├── pokemon-cries/                ← Dossier cris (optionnel)
│   ├── 1.mp3
│   ├── 2.mp3
│   └── ...
└── pokemon-images/               ← Dossier images Pokémon
    ├── 1.png
    ├── 2.png
    └── ...
```

### 3. Activer GitHub Pages

1. Va dans ton repository
2. Clique sur "Settings"
3. Dans le menu de gauche, clique sur "Pages"
4. Dans "Source", sélectionne "main" branch
5. Clique sur "Save"
6. Attends quelques minutes
7. Ton site sera disponible sur : `https://TON_USERNAME.github.io/pokemon-quiz/`

### 4. Partager avec tes amis

Envoie-leur simplement le lien :
```
https://TON_USERNAME.github.io/pokemon-quiz/
```

Ils pourront :
- ✅ Jouer directement dans le navigateur
- ✅ Installer l'app sur leur téléphone/tablette
- ✅ Jouer hors ligne après la première visite

## 📱 Installation en tant qu'application

### Sur téléphone/tablette :

**Android (Chrome) :**
1. Ouvre le site
2. Appuie sur le menu ⋮
3. Sélectionne "Installer l'application" ou "Ajouter à l'écran d'accueil"

**iOS (Safari) :**
1. Ouvre le site
2. Appuie sur le bouton de partage 
3. Sélectionne "Sur l'écran d'accueil"

### Sur ordinateur :

**Chrome/Edge :**
1. Ouvre le site
2. Clique sur l'icône ⊕ dans la barre d'adresse
3. Clique sur "Installer"

## 🎨 Créer les icônes

Tu dois créer 2 icônes pour l'app :

- **icon-192.png** : 192x192 pixels
- **icon-512.png** : 512x512 pixels

Tu peux utiliser un logo Pokéball, Pikachu, ou créer ton propre design !

**Outils en ligne gratuits :**
- [Canva](https://www.canva.com) - Créer des icônes
- [Favicon.io](https://favicon.io) - Générer des icônes

## 🔧 Mise à jour du jeu

Pour mettre à jour le jeu :

1. Modifie les fichiers dans ton repository GitHub
2. Change la version dans `service-worker.js` :
   ```javascript
   const CACHE_VERSION = 'pokemon-quiz-v1.0.1'; // Incrémenter
   ```
3. Les utilisateurs verront une notification "Nouvelle version disponible"
4. Ils cliquent sur "Mettre à jour" pour obtenir la nouvelle version

## 📦 Optimisation

### Réduire la taille (optionnel)

Si ton repository est trop gros :

1. **Compresser les images** avec [TinyPNG](https://tinypng.com)
2. **Compresser les MP3** avec [Online Audio Converter](https://online-audio-converter.com)
3. **Utiliser des sprites** au lieu de fichiers individuels

### Fichiers optionnels

Tu peux ne pas inclure :
- `pokemon-music/` (pas de musique)
- `pokemon-cries/` (pas de cris)

Le jeu fonctionnera quand même !

## 🐛 Problèmes courants

### "Failed to register service worker"
→ GitHub Pages doit être activé et le site accessible en HTTPS

### "Les fichiers ne se chargent pas"
→ Vérifie que tous les chemins de fichiers sont corrects (commence par `./`)

### "L'app ne s'installe pas"
→ Assure-toi d'avoir créé les icônes (icon-192.png et icon-512.png)

## 📝 Licence

Ce projet est à usage personnel. Les Pokémon sont © Nintendo/Creatures Inc./GAME FREAK inc.

## 🎉 Amusez-vous bien !

Si tu as des questions, n'hésite pas à ouvrir une issue sur GitHub !

---

**Créé avec ❤️ pour apprendre les Pokémon**
