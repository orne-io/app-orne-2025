# Build Sécurisé - ORNE DApp

Ce dossier contient des scripts pour effectuer des builds sécurisés qui évitent de mettre l'application hors ligne pendant le processus de build.

## Scripts Disponibles

### `build:safe`
Build sécurisé pour la production (mainnet)
```bash
npm run build:safe
```

### `build:safe:testnet`
Build sécurisé pour le testnet
```bash
npm run build:safe:testnet
```

## Comment ça fonctionne

1. **Création d'un dossier temporaire** : Le script crée un dossier `build-temp` (ou `build-temp-testnet`)
2. **Copie des fichiers sources** : Tous les fichiers nécessaires sont copiés dans le dossier temporaire
3. **Installation des dépendances** : `npm ci` est exécuté dans le dossier temporaire
4. **Build** : Le build est effectué dans le dossier temporaire
5. **Sauvegarde** : L'ancien build est sauvegardé dans `build-backup`
6. **Déploiement** : Le nouveau build est copié vers le dossier `build` principal
7. **Nettoyage** : Les dossiers temporaires sont supprimés

## Avantages

- ✅ **Pas de downtime** : L'application reste en ligne pendant le build
- ✅ **Rollback automatique** : En cas d'échec, l'ancien build est restauré
- ✅ **Build isolé** : Le build se fait dans un environnement propre
- ✅ **Sauvegarde** : L'ancien build est sauvegardé avant remplacement

## En cas d'échec

Si le build échoue :
1. L'ancien build est automatiquement restauré
2. L'application continue de fonctionner avec la version précédente
3. Les dossiers temporaires sont nettoyés
4. Un message d'erreur détaillé est affiché

## Utilisation Recommandée

Pour les déploiements en production, utilisez toujours :
```bash
# Pour mainnet
npm run build:safe

# Pour testnet
npm run build:safe:testnet
```

## Structure des Dossiers

```
scripts/
├── build-safe.js          # Build sécurisé mainnet
├── build-safe-testnet.js  # Build sécurisé testnet
└── README-BUILD.md        # Ce fichier

# Dossiers temporaires créés pendant le build
build-temp/                # Dossier temporaire mainnet
build-temp-testnet/        # Dossier temporaire testnet
build-backup/              # Sauvegarde mainnet
build-backup-testnet/      # Sauvegarde testnet
```

## Logs

Le script affiche des logs détaillés avec des emojis pour suivre le processus :
- 🚀 Début du processus
- 📁 Création de dossiers
- 📋 Copie de fichiers
- 📦 Installation de dépendances
- 🔨 Build en cours
- 💾 Sauvegarde
- ✅ Succès
- ❌ Erreur
- 🔄 Restauration
- 🧹 Nettoyage 