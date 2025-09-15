#!/bin/bash

echo "🔄 Mise à jour de MHCerts..."

# Aller dans le dossier du projet
cd /home/mhcerts/mhcerts

# Configurer Git pour éviter l'erreur d'ownership (une seule fois)
if ! git config --global --get safe.directory | grep -q "/home/mhcerts/mhcerts"; then
    echo "🔧 Configuration Git..."
    git config --global --add safe.directory /home/mhcerts/mhcerts
fi

# Sauvegarder les fichiers de données persistantes
echo "💾 Sauvegarde des données persistantes..."
if [ -f "treated-certificates.json" ]; then
    cp treated-certificates.json /tmp/treated-certificates-backup.json
    echo "✅ Fichier treated-certificates.json sauvegardé"
fi

# Nettoyer le workspace (sauf les fichiers de données)
echo "🧹 Nettoyage du workspace..."
# Ne pas utiliser git clean -fd car cela supprime les nouveaux fichiers
# Utiliser git restore pour remettre les fichiers modifiés
git restore .

# Restaurer les fichiers de données persistantes
echo "🔄 Restauration des données persistantes..."
if [ -f "/tmp/treated-certificates-backup.json" ]; then
    mv /tmp/treated-certificates-backup.json treated-certificates.json
    echo "✅ Fichier treated-certificates.json restauré"
fi

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
