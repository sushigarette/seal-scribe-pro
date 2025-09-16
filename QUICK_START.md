# 🚀 Démarrage Rapide - MHCerts

## Qu'est-ce que MHCerts ?

**MHCerts** est un gestionnaire de certificats numériques qui vous aide à :
- 📊 **Surveiller** tous vos certificats en un coup d'œil
- ⚠️ **Détecter** les certificats qui expirent bientôt
- ✅ **Marquer** les certificats traités pour éviter de les retraiter
- 📁 **Exporter** vos données en CSV pour l'audit

## 🎯 Interface principale

### Tableau de bord
- **4 cartes statistiques** : Total, Valides, Expirent bientôt, Expirés
- **Cliquez sur une carte** pour filtrer automatiquement la liste
- **Bouton Actualiser** pour mettre à jour les données

### Filtres et recherche
- **Barre de recherche** : Tapez un nom, émetteur ou numéro de série
- **Filtre par statut** : Valide, Expire bientôt, Expiré
- **Filtre par type** : SSL/TLS, Code Signing, Email, Client, etc.

### Onglets
- **En attente** : Certificats à traiter (avec pagination)
- **Traités** : Certificats déjà mis à jour (avec pagination)

## 🔧 Actions disponibles

### Sur chaque certificat
- **Voir détails** : Informations complètes dans une popup
- **Télécharger** : Téléchargement du certificat
- **Marquer traité** : Retire le certificat de la liste (seulement pour expirés/expirant)
- **Remettre en attente** : Remet un certificat traité en attente

### Export de données
- **Bouton "Exporter CSV"** : Télécharge les certificats visibles
- **Nom de fichier intelligent** : Inclut les filtres et la date
- **Données complètes** : Toutes les informations importantes

## ⚙️ Configuration

### Certificats client requis
Placez vos fichiers dans le dossier `certs/` :
- `client.crt` - Votre certificat client
- `client.key` - Votre clé privée

### Démarrage
```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur proxy
npm run server:start

# 3. Démarrer l'interface (nouveau terminal)
npm run dev
```

## 🎨 Navigation

### Pagination
- **10 éléments par page** par défaut
- **Changer la taille** : Menu déroulant "Par page"
- **Navigation** : Boutons < > et numéros de pages
- **Compteur** : "Affichage de 1 à 10 sur 45 éléments"

### Filtres intelligents
- **Réinitialisation automatique** de la pagination lors des filtres
- **Combinaison possible** : Recherche + statut + type
- **Scroll automatique** vers la liste après filtrage

## 💡 Conseils d'utilisation

### Workflow recommandé
1. **Consultez le tableau de bord** pour avoir une vue d'ensemble
2. **Cliquez sur "Expirent bientôt"** pour voir les certificats prioritaires
3. **Marquez comme traités** les certificats que vous avez mis à jour
4. **Exportez en CSV** pour documenter vos actions

### Gestion des erreurs
- **Certificats manquants** : Vérifiez que `client.crt` et `client.key` sont présents
- **Erreur de connexion** : Vérifiez que le serveur proxy est démarré
- **Données non synchronisées** : Les données sont sauvegardées localement même en cas d'erreur

## 🔄 Mise à jour

### Développement
```bash
git pull origin main
npm install
npm run build
```

### Production (Raspberry Pi)
```bash
./update-mhcerts.sh
```

## 📞 Support

- **Documentation complète** : Voir les fichiers .md du projet
- **Issues GitHub** : Signaler les bugs et demander des fonctionnalités
- **Logs du serveur** : Vérifiez les messages d'erreur dans la console

---

**MHCerts** : Gestion simple et efficace de vos certificats ! 🛡️✨
