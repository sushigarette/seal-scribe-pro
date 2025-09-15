# Configuration de MHCerts

## Installation locale

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone https://github.com/sushigarette/seal-scribe-pro.git
cd seal-scribe-pro

# Renommer le dossier (optionnel)
mv seal-scribe-pro mhcerts
cd mhcerts

# Installer les dépendances
npm install

# Placer les certificats client
mkdir certs
# Copier client.crt et client.key dans le dossier certs/

# Démarrer le serveur proxy
npm run server:start

# Dans un autre terminal, démarrer le frontend
npm run dev
```

## Déploiement sur Raspberry Pi

### Prérequis
- Raspberry Pi 4B avec Raspberry Pi OS
- Node.js 18+
- Nginx

### Installation
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer Nginx
sudo apt install nginx -y

# Cloner le projet
git clone https://github.com/sushigarette/seal-scribe-pro.git
cd seal-scribe-pro

# Renommer le dossier
mv seal-scribe-pro mhcerts
cd mhcerts

# Installer les dépendances
npm install

# Placer les certificats client
mkdir certs
# Copier client.crt et client.key dans le dossier certs/

# Construire l'application
npm run build

# Configurer Nginx
sudo nano /etc/nginx/sites-available/mhcerts
```

### Configuration Nginx
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/mhcerts;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Activation du site
```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/mhcerts /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Copier les fichiers
sudo mkdir -p /var/www/mhcerts
sudo cp -r dist/* /var/www/mhcerts/
sudo cp server.js package.json /var/www/mhcerts/
sudo cp -r node_modules /var/www/mhcerts/
sudo cp -r certs /var/www/mhcerts/

# Donner les permissions
sudo chown -R www-data:www-data /var/www/mhcerts/
sudo chmod -R 755 /var/www/mhcerts/

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Service automatique
```bash
# Créer le service systemd
sudo nano /etc/systemd/system/mhcerts.service
```

```ini
[Unit]
Description=MHCerts Certificate Manager
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mhcerts
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable mhcerts
sudo systemctl start mhcerts
```

## Mise à jour du projet

### Création du script automatique
```bash
# Sur le Pi
cd /home/mhcerts/mhcerts

# Créer le script de mise à jour
nano update-mhcerts.sh
```

**Contenu du script `update-mhcerts.sh` :**
```bash
#!/bin/bash

echo "🔄 Mise à jour de MHCerts..."

# Aller dans le dossier du projet
cd /home/mhcerts/mhcerts

# Configurer Git pour éviter l'erreur d'ownership (une seule fois)
if ! git config --global --get safe.directory | grep -q "/home/mhcerts/mhcerts"; then
    echo "🔧 Configuration Git..."
    git config --global --add safe.directory /home/mhcerts/mhcerts
fi

# Nettoyer le workspace
echo "🧹 Nettoyage du workspace..."
git clean -fd
git restore .

# Récupérer les dernières modifications
echo "📥 Récupération des modifications..."
git pull origin main

# Installer les dépendances
echo " Installation des dépendances..."
npm install

# Construire l'application
echo "🔨 Construction de l'application..."
npm run build

# Copier les fichiers vers le dossier web
echo " Copie des fichiers..."
sudo cp -r dist/* /var/www/mhcerts/

# Redémarrer le service
echo "🔄 Redémarrage du service..."
sudo systemctl restart mhcerts

echo "✅ Mise à jour terminée !"
echo " Application disponible sur : http://192.168.1.105/"
```

```bash
# Rendre le script exécutable
chmod +x update-mhcerts.sh
```

### Méthode 1 : Script automatique (recommandé)
```bash
# Sur le Pi
cd /home/mhcerts/mhcerts
./update-mhcerts.sh
```

### Méthode 2 : Commandes manuelles
```bash
# Sur le Pi
cd /home/mhcerts/mhcerts

# Configurer Git (une seule fois)
git config --global --add safe.directory /home/mhcerts/mhcerts

# Nettoyer le workspace
git clean -fd
git restore .

# Récupérer les modifications
git pull origin main

# Installer les dépendances
npm install

# Construire l'application
npm run build

# Copier les fichiers
sudo cp -r dist/* /var/www/mhcerts/

# Redémarrer le service
sudo systemctl restart mhcerts
```

### Méthode 3 : Depuis votre Mac
```bash
# Sur votre Mac
git add .
git commit -m "Description des modifications"
git push origin main

# Puis sur le Pi
cd /home/mhcerts/mhcerts
./update-mhcerts.sh
```

## Dépannage

### Vérifier le statut du service
```bash
sudo systemctl status mhcerts
```

### Voir les logs
```bash
sudo journalctl -u mhcerts -f
```

### Vérifier les ports
```bash
sudo lsof -i :3001
sudo lsof -i :80
```

### Redémarrer tout
```bash
sudo systemctl restart mhcerts
sudo systemctl restart nginx
```

## Accès
- **Local** : http://localhost:8080
- **Réseau** : http://192.168.1.105/