# MHCerts - Gestionnaire de Certificats Numériques

## 🛡️ Vue d'ensemble

**MHCerts** est une application web moderne et intuitive dédiée à la gestion des certificats numériques. Développée avec React et TypeScript, elle offre une interface utilisateur élégante et des fonctionnalités avancées pour surveiller, organiser et traiter efficacement vos certificats SSL/TLS, de signature de code, et autres certificats numériques.

## 🎯 Problématique résolue

La gestion manuelle des certificats numériques peut rapidement devenir un cauchemar :
- **Surveillance complexe** : Difficile de suivre l'état de centaines de certificats
- **Risques de sécurité** : Certificats expirés non détectés à temps
- **Travail répétitif** : Retraiter les mêmes certificats plusieurs fois
- **Manque de visibilité** : Aucun aperçu global de l'état des certificats

MHCerts résout ces problèmes en automatisant la surveillance et en offrant des outils de gestion intelligents.

## ✨ Fonctionnalités principales

### 🔍 **Surveillance en temps réel**
- **Récupération automatique** des certificats depuis l'API MHComm
- **Authentification par certificat client** pour un accès sécurisé
- **Actualisation périodique** des données (toutes les 5 minutes)
- **Détection intelligente** des certificats expirés et expirant bientôt

### 📊 **Tableau de bord intuitif**
- **Statistiques en temps réel** : Total, Valides, Expirant bientôt, Expirés
- **Cartes cliquables** pour filtrer instantanément par statut
- **Compteurs dynamiques** mis à jour automatiquement
- **Interface responsive** adaptée à tous les écrans

### 🏷️ **Système de classification intelligent**
- **Détection automatique du type** : SSL/TLS, Code Signing, Email, Client, etc.
- **Parsing des Distinguished Names** pour extraire les informations pertinentes
- **Génération de noms lisibles** à partir des données techniques
- **Catégorisation par émetteur** et organisation

### 🔄 **Gestion des certificats traités**
- **Marquage intelligent** : Seuls les certificats expirés/expirant peuvent être marqués
- **Onglets séparés** : "En attente" et "Traités" pour une organisation claire
- **Bouton de dé-marquage** : Possibilité de remettre un certificat en attente
- **Confirmation avant action** : Évite les erreurs de manipulation
- **Synchronisation automatique** avec le serveur

### 🔍 **Filtrage et recherche avancés**
- **Recherche textuelle** : Par nom, émetteur, numéro de série
- **Filtres par statut** : Valide, Expirant bientôt, Expiré
- **Filtres par type** : SSL/TLS, Code Signing, Email, Client, etc.
- **Filtres combinables** : Recherche + statut + type simultanément
- **Réinitialisation automatique** de la pagination lors des filtres

### 📄 **Pagination performante**
- **10 éléments par page** par défaut (configurable : 5, 10, 20, 50, 100)
- **Navigation intelligente** avec boutons précédent/suivant
- **Numéros de pages** avec ellipses pour les grandes listes
- **Compteurs d'éléments** : "Affichage de 1 à 10 sur 45 éléments"
- **Pagination séparée** pour les listes en attente et traitées

### 📊 **Export de données**
- **Export CSV intelligent** : Seulement les certificats visibles (filtrés)
- **Nom de fichier dynamique** : Inclut les filtres appliqués et la date
- **En-têtes en français** : Compatible avec Excel et LibreOffice
- **Données complètes** : Nom, émetteur, date d'expiration, statut, type, etc.

### 🔧 **Gestion des détails**
- **Vue détaillée** : Informations complètes sur chaque certificat
- **Modal responsive** : Affichage optimisé sur tous les écrans
- **Données techniques** : Numéro de série, Distinguished Name, etc.
- **Actions contextuelles** : Téléchargement et marquage depuis la vue détail

## 🏗️ Architecture technique

### **Frontend (React + TypeScript)**
- **React 18** avec hooks modernes
- **TypeScript** pour la sécurité des types
- **Vite** pour un développement rapide
- **Tailwind CSS** pour un design responsive
- **shadcn/ui** pour des composants élégants
- **React Query** pour la gestion des données et le cache

### **Backend (Node.js + Express)**
- **Proxy sécurisé** pour l'authentification par certificat client
- **API REST** pour la gestion des certificats traités
- **Gestion des erreurs** robuste avec messages informatifs
- **Logs détaillés** pour le débogage et la surveillance

### **Sécurité**
- **Authentification par certificat client** (.crt + .key)
- **HTTPS obligatoire** pour toutes les communications
- **Validation des données** côté client et serveur
- **Protection CORS** configurée

### **Déploiement**
- **Docker-ready** : Configuration pour conteneurisation
- **Nginx** comme reverse proxy
- **Systemd** pour le démarrage automatique
- **Script de mise à jour** automatisé
- **Protection des données** persistantes

## 🚀 Installation et déploiement

### **Développement local**
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

### **Production (Raspberry Pi)**
```bash
# Installation complète avec Nginx et Systemd
# Voir SETUP.md pour les instructions détaillées

# Mise à jour automatique
./update-mhcerts.sh
```

## 📈 Avantages

### **Pour les administrateurs système**
- **Gain de temps** : Surveillance automatisée des certificats
- **Réduction des risques** : Détection précoce des expirations
- **Organisation claire** : Séparation des certificats traités/non traités
- **Rapports détaillés** : Export CSV pour l'audit et la documentation

### **Pour les équipes de sécurité**
- **Visibilité complète** : Vue d'ensemble de l'état des certificats
- **Alertes proactives** : Notifications des certificats expirant bientôt
- **Traçabilité** : Historique des actions effectuées
- **Conformité** : Documentation des processus de gestion

### **Pour l'organisation**
- **Réduction des coûts** : Évite les pannes dues aux certificats expirés
- **Amélioration de la sécurité** : Gestion proactive des certificats
- **Efficacité opérationnelle** : Processus automatisés et optimisés
- **Scalabilité** : Gestion de milliers de certificats sans problème

## 🔮 Évolutions futures

### **Fonctionnalités prévues**
- **Notifications par email** : Alertes automatiques avant expiration
- **Intégration LDAP** : Authentification centralisée
- **API REST complète** : Intégration avec d'autres outils
- **Tableau de bord avancé** : Graphiques et métriques détaillées
- **Gestion des équipes** : Rôles et permissions utilisateurs

### **Améliorations techniques**
- **Cache Redis** : Amélioration des performances
- **Tests automatisés** : Couverture de code complète
- **CI/CD** : Déploiement automatisé
- **Monitoring** : Métriques de performance et d'utilisation

## 📞 Support et contribution

### **Documentation**
- **SETUP.md** : Guide d'installation détaillé
- **CERTIFICATS_TRAITES.md** : Documentation du système de gestion
- **PROTECTED_FILES.md** : Gestion des fichiers persistants

### **Support technique**
- **Issues GitHub** : Signalement des bugs et demandes de fonctionnalités
- **Documentation complète** : Guides et exemples d'utilisation
- **Communauté active** : Aide et partage d'expériences

---

**MHCerts** : La solution moderne et efficace pour la gestion de vos certificats numériques. 🛡️✨
