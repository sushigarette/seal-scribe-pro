# MHCerts - Gestionnaire de Certificats Numériques

🛡️ **Application web moderne pour la gestion et la surveillance des certificats numériques**

## 🎯 Aperçu

MHCerts est une solution complète développée avec React et TypeScript pour surveiller, organiser et gérer efficacement vos certificats SSL/TLS, de signature de code, et autres certificats numériques.

## ✨ Fonctionnalités principales

- 🔍 **Surveillance en temps réel** des certificats via API sécurisée
- 📊 **Tableau de bord intuitif** avec statistiques cliquables
- 🏷️ **Classification automatique** par type (SSL/TLS, Code Signing, etc.)
- 🔄 **Gestion des certificats traités** avec onglets séparés
- 🔍 **Filtrage et recherche avancés** par nom, statut, type
- 📄 **Pagination performante** pour de grandes listes
- 📊 **Export CSV intelligent** des données filtrées
- 🔧 **Vue détaillée** avec informations complètes

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Certificats client (.crt et .key)

### Installation
```bash
# Cloner le projet
git clone https://github.com/sushigarette/seal-scribe-pro.git
cd seal-scribe-pro

# Installer les dépendances
npm install

# Placer les certificats client
mkdir certs
# Copier client.crt et client.key dans certs/

# Démarrer le serveur proxy
npm run server:start

# Démarrer le frontend (nouveau terminal)
npm run dev
```

### Accès
- **Frontend** : http://localhost:8080
- **API** : http://localhost:3001/api/certificates

## 🏗️ Architecture

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend** : Node.js + Express (proxy sécurisé)
- **Authentification** : Certificats client HTTPS
- **Déploiement** : Nginx + Systemd (Raspberry Pi)

## 📚 Documentation

- **[PRESENTATION.md](./PRESENTATION.md)** - Présentation complète du projet
- **[SETUP.md](./SETUP.md)** - Guide d'installation détaillé
- **[CERTIFICATS_TRAITES.md](./CERTIFICATS_TRAITES.md)** - Système de gestion des certificats traités
- **[PROTECTED_FILES.md](./PROTECTED_FILES.md)** - Gestion des fichiers persistants

## 🔧 Scripts disponibles

```bash
npm run dev              # Démarrage du frontend en développement
npm run build            # Construction de production
npm run server:start     # Démarrage du serveur proxy
npm run server:dev       # Serveur proxy en mode développement
npm run start:all        # Démarrage simultané frontend + backend
```

## 🛡️ Sécurité

- Authentification par certificat client obligatoire
- Communication HTTPS sécurisée
- Validation des données côté client et serveur
- Protection CORS configurée

## 📈 Avantages

- **Gain de temps** : Surveillance automatisée des certificats
- **Réduction des risques** : Détection précoce des expirations
- **Organisation claire** : Séparation des certificats traités/non traités
- **Rapports détaillés** : Export CSV pour l'audit

---

**MHCerts** : La solution moderne pour la gestion de vos certificats numériques ! 🚀