# Certificate Manager - Installation Ubuntu 22.04 LTS

Application web légère pour la gestion et la surveillance de certificats X.509 stockés dans des archives tar.gz.

## 🚀 Fonctionnalités

- **Détection automatique** des certificats présents et ajoutés
- **Parsing X.509** complet (CN, SANs, émetteur, dates, empreintes, etc.)
- **Interface web moderne** avec recherche, tri et filtres
- **Téléchargement sécurisé** des archives tar.gz
- **Surveillance en temps réel** du répertoire
- **Export CSV/JSON** des données
- **Authentification** (Basic Auth ou Token)
- **Métriques Prometheus** intégrées
- **API REST** complète

## 📋 Prérequis

- Ubuntu 22.04 LTS (amd64)
- Accès root ou sudo
- Connexion internet pour l'installation des dépendances

## 🛠️ Installation Rapide

### Option 1: Installation automatique (recommandée)

```bash
# Cloner le projet
git clone <votre-repo>
cd seal-scribe-pro

# Exécuter le script d'installation
sudo ./install.sh
```

### Option 2: Installation manuelle

#### 1. Installation des dépendances système

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    pkg-config \
    python3.10 \
    python3.10-venv \
    python3-pip \
    nodejs \
    npm \
    curl \
    ufw
```

#### 2. Création de l'utilisateur

```bash
sudo useradd -m -s /bin/bash certmanager
sudo mkdir -p /data/certs
sudo chown -R certmanager:certmanager /data/certs
```

#### 3. Installation de l'application

```bash
# Cloner dans /opt
sudo git clone <votre-repo> /opt/certificate-manager
sudo chown -R certmanager:certmanager /opt/certificate-manager

# Installation des dépendances Python
cd /opt/certificate-manager
sudo -u certmanager python3 -m venv venv
sudo -u certmanager ./venv/bin/pip install -r backend/requirements.txt

# Build du frontend
sudo -u certmanager npm install
sudo -u certmanager npm run build
sudo -u certmanager cp -r dist/* backend/app/static/
```

#### 4. Configuration du service systemd

```bash
sudo cp certificate-manager.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable certificate-manager
```

#### 5. Configuration du firewall

```bash
sudo ufw enable
sudo ufw allow 8080/tcp
sudo ufw allow ssh
```

#### 6. Démarrage du service

```bash
sudo systemctl start certificate-manager
sudo systemctl status certificate-manager
```

## 🐳 Installation avec Docker

### Docker Compose (recommandé)

```bash
# Cloner le projet
git clone <votre-repo>
cd seal-scribe-pro

# Créer le répertoire des certificats
mkdir -p data/certs

# Démarrer avec Docker Compose
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

### Docker simple

```bash
# Build de l'image
docker build -t certificate-manager .

# Exécution
docker run -d \
  --name certificate-manager \
  -p 8080:8080 \
  -v /path/to/your/certs:/data/certs:ro \
  -e CERTS_DIR=/data/certs \
  certificate-manager
```

## ⚙️ Configuration

### Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `CERTS_DIR` | `/data/certs` | Répertoire surveillé pour les archives |
| `PORT` | `8080` | Port d'écoute de l'application |
| `HOST` | `0.0.0.0` | Adresse d'écoute |
| `SCAN_INTERVAL_SEC` | `300` | Intervalle de scan en secondes |
| `THRESHOLD_DAYS` | `30` | Seuil d'alerte d'expiration (jours) |
| `AUTH_TOKEN` | - | Token d'authentification (optionnel) |
| `BASIC_USER` | - | Utilisateur Basic Auth (optionnel) |
| `BASIC_PASS` | - | Mot de passe Basic Auth (optionnel) |
| `SECRET_KEY` | - | Clé secrète pour JWT |

### Configuration de l'authentification

#### Option 1: Token d'authentification

```bash
# Dans /opt/certificate-manager/.env
AUTH_TOKEN=your-secret-token-here
```

#### Option 2: Basic Authentication

```bash
# Dans /opt/certificate-manager/.env
BASIC_USER=admin
BASIC_PASS=your-secure-password
```

## 📁 Structure des archives

L'application surveille un répertoire contenant des archives au format :

```
NOM.tar.gz
└── (archive)
    ├── certs/
    │   └── *.crt (certificats PEM/DER)
    └── private/
        └── *.key (clés privées - JAMAIS lues/exposées)
```

## 🔧 Utilisation

### Interface Web

Accédez à l'interface web : `http://votre-serveur:8080`

- **Liste des certificats** avec recherche et filtres
- **Détails complets** de chaque certificat
- **Téléchargement** des archives tar.gz
- **Export** en CSV/JSON
- **Statistiques** en temps réel

### API REST

#### Endpoints principaux

- `GET /api/v1/health` - État de l'application
- `GET /api/v1/certs` - Liste des certificats (paginée)
- `GET /api/v1/certs/{name}` - Détails d'un certificat
- `GET /api/v1/certs/{name}/download` - Téléchargement d'une archive
- `GET /api/v1/stats` - Statistiques
- `POST /api/v1/rescan` - Forcer un rescan
- `GET /api/v1/export/csv` - Export CSV
- `GET /api/v1/export/json` - Export JSON
- `GET /metrics` - Métriques Prometheus

#### Exemple d'utilisation

```bash
# Liste des certificats
curl -H "Authorization: Bearer your-token" \
  "http://localhost:8080/api/v1/certs?page=1&size=20"

# Télécharger une archive
curl -H "Authorization: Bearer your-token" \
  "http://localhost:8080/api/v1/certs/exemple-com/download" \
  -o exemple-com.tar.gz

# Forcer un rescan
curl -X POST -H "Authorization: Bearer your-token" \
  "http://localhost:8080/api/v1/rescan"
```

## 🔍 Surveillance et logs

### Logs du service

```bash
# Voir les logs en temps réel
sudo journalctl -u certificate-manager -f

# Voir les logs récents
sudo journalctl -u certificate-manager --since "1 hour ago"
```

### Métriques Prometheus

```bash
# Récupérer les métriques
curl http://localhost:8080/metrics
```

### Vérification de l'état

```bash
# Statut du service
sudo systemctl status certificate-manager

# Test de l'API
curl http://localhost:8080/health
```

## 🧪 Tests et démonstration

### Génération de certificats de test

```bash
# Générer des archives de démonstration
./scripts/generate-demo-certs.sh ./demo-certs

# Copier vers le répertoire de surveillance
sudo cp demo-certs/*.tar.gz /data/certs/
sudo chown certmanager:certmanager /data/certs/*.tar.gz
```

### Test de l'application

```bash
# Vérifier que l'application détecte les certificats
curl http://localhost:8080/api/v1/stats

# Tester le téléchargement
curl http://localhost:8080/api/v1/certs/exemple-com/download -o test.tar.gz
```

## 🔒 Sécurité

### Recommandations

1. **Changez le SECRET_KEY** en production
2. **Configurez l'authentification** (token ou Basic Auth)
3. **Utilisez HTTPS** avec un reverse proxy (nginx)
4. **Limitez l'accès réseau** avec un firewall
5. **Surveillez les logs** régulièrement

### Configuration nginx (exemple)

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚨 Dépannage

### Problèmes courants

#### Service ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u certificate-manager -n 50

# Vérifier les permissions
sudo chown -R certmanager:certmanager /opt/certificate-manager
sudo chown -R certmanager:certmanager /data/certs
```

#### Certificats non détectés

```bash
# Vérifier le répertoire de surveillance
ls -la /data/certs/

# Forcer un rescan
curl -X POST http://localhost:8080/api/v1/rescan

# Vérifier les logs de surveillance
sudo journalctl -u certificate-manager | grep -i "scan\|certificate"
```

#### Erreur de permissions

```bash
# Réparer les permissions
sudo chown -R certmanager:certmanager /opt/certificate-manager
sudo chmod 755 /data/certs
sudo chmod 644 /data/certs/*.tar.gz
```

### Logs utiles

```bash
# Logs du service
sudo journalctl -u certificate-manager -f

# Logs système
sudo journalctl -f

# Logs d'erreur
sudo journalctl -u certificate-manager --priority=err
```

## 📊 Monitoring

### Métriques disponibles

- `http_requests_total` - Nombre total de requêtes HTTP
- `http_request_duration_seconds` - Durée des requêtes HTTP
- `certificates_total` - Nombre total de certificats
- `certificates_by_status` - Certificats par statut

### Intégration Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'certificate-manager'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

## 🔄 Mise à jour

### Mise à jour du code

```bash
# Arrêter le service
sudo systemctl stop certificate-manager

# Sauvegarder la configuration
sudo cp /opt/certificate-manager/.env /tmp/

# Mettre à jour le code
cd /opt/certificate-manager
sudo git pull

# Restaurer la configuration
sudo cp /tmp/.env /opt/certificate-manager/

# Rebuild et redémarrer
sudo -u certmanager npm run build
sudo -u certmanager cp -r dist/* backend/app/static/
sudo systemctl start certificate-manager
```

### Mise à jour Docker

```bash
# Arrêter les conteneurs
docker-compose down

# Mettre à jour les images
docker-compose pull

# Redémarrer
docker-compose up -d
```

## 📝 Maintenance

### Nettoyage des logs

```bash
# Nettoyer les anciens logs
sudo journalctl --vacuum-time=30d

# Limiter la taille des logs
sudo journalctl --vacuum-size=100M
```

### Sauvegarde

```bash
# Sauvegarder la base de données
sudo cp /opt/certificate-manager/data/certificates.db /backup/

# Sauvegarder la configuration
sudo cp /opt/certificate-manager/.env /backup/
```

## 🤝 Support

Pour obtenir de l'aide :

1. Vérifiez les logs : `sudo journalctl -u certificate-manager -f`
2. Consultez la documentation API : `http://localhost:8080/docs`
3. Vérifiez l'état du service : `sudo systemctl status certificate-manager`

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
