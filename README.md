# Seal Scribe Pro

Application de gestion de certificats professionnels construite avec React, TypeScript et Tailwind CSS.

## Technologies utilisées

- **Vite** - Outil de build rapide et moderne
- **TypeScript** - Langage de programmation typé
- **React** - Bibliothèque UI
- **shadcn/ui** - Composants UI modernes
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router** - Routage côté client

## Installation et développement

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <URL_DU_REPOSITORY>

# Naviguer vers le dossier du projet
cd seal-scribe-pro

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run build:dev` - Construit l'application en mode développement
- `npm run preview` - Prévisualise la build de production
- `npm run lint` - Exécute le linter ESLint

## Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (shadcn/ui)
│   ├── CertificateDetail.tsx
│   ├── CertificateFilters.tsx
│   └── CertificateListItem.tsx
├── hooks/              # Hooks personnalisés
├── lib/                # Utilitaires et configurations
├── pages/              # Pages de l'application
└── main.tsx           # Point d'entrée de l'application
```

## Déploiement

Pour déployer l'application :

```bash
# Construire l'application
npm run build

# Les fichiers de production seront dans le dossier 'dist'
```

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter vos changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT.