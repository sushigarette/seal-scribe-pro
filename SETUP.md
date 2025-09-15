# Configuration de Seal Scribe Pro

## Prérequis

- Node.js 18+ 
- npm ou yarn
- Vos certificats client (.crt et .key)

## Installation

1. **Installer les dépendances :**
   ```bash
   npm install
   ```

2. **Configurer les certificats :**
   - Créez le dossier `certs/` s'il n'existe pas
   - Placez vos fichiers de certificat dans le dossier `certs/` :
     - `client.crt` - Votre certificat client
     - `client.key` - Votre clé privée
     - `ca.crt` - (Optionnel) Certificat d'autorité de certification

3. **Démarrer l'application :**

   **Option 1 - Démarrage complet (recommandé) :**
   ```bash
   npm run start:all
   ```
   Cette commande démarre à la fois le serveur proxy et l'application frontend.

   **Option 2 - Démarrage séparé :**
   ```bash
   # Terminal 1 - Serveur proxy
   npm run server:start
   
   # Terminal 2 - Application frontend
   npm run dev
   ```

## Configuration du serveur proxy

Le serveur proxy (`server.js`) gère l'authentification par certificat client avec l'API des certificats. Il écoute sur le port 3001 par défaut.

### Variables d'environnement

Vous pouvez configurer le serveur avec les variables d'environnement suivantes :

```bash
PORT=3001  # Port du serveur proxy (défaut: 3001)
```

### Configuration des certificats

Le serveur utilise les certificats situés dans le dossier `certs/` :
- `client.crt` - Certificat client (requis)
- `client.key` - Clé privée (requis)
- `ca.crt` - Certificat CA (optionnel)

## Utilisation

1. **Accéder à l'application :**
   - Frontend : http://localhost:5173
   - API Proxy : http://localhost:3001/api/certificates

2. **Fonctionnalités :**
   - Visualisation des certificats depuis l'API JSON
   - Filtrage par statut (valide, expire bientôt, expiré)
   - Filtrage par type de certificat
   - Recherche par nom, émetteur ou numéro de série
   - Actualisation automatique toutes les 5 minutes
   - Détails complets de chaque certificat

## Dépannage

### Erreur de certificat
Si vous obtenez une erreur de certificat, vérifiez :
- Que vos fichiers `client.crt` et `client.key` sont dans le dossier `certs/`
- Que les permissions des fichiers sont correctes
- Que les certificats ne sont pas expirés

### Erreur de connexion
Si l'API ne répond pas :
- Vérifiez que l'URL `https://office.mhcomm.fr/crtinfo/certindex.json` est accessible
- Vérifiez que vos certificats sont valides pour cette API
- Consultez les logs du serveur proxy

### Port déjà utilisé
Si le port 3001 est déjà utilisé :
```bash
PORT=3002 npm run server:start
```

## Structure des données

L'application s'attend à recevoir un JSON avec la structure suivante :
```json
[
  {
    "dn": "/C=FR/ST=Alsace/L=Strasbourg/O=MHComm/OU=AURAL/CN=logsvc_aural",
    "serno": "2CBD",
    "not_aft": "2027-03-10T14:29:00"
  }
]
```

## Sécurité

⚠️ **Important** :
- Ne commitez jamais vos certificats et clés privées
- Le dossier `certs/` est exclu du contrôle de version
- Utilisez des certificats avec des permissions restrictives
- En production, utilisez un serveur HTTPS pour le proxy
