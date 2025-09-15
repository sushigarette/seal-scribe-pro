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
