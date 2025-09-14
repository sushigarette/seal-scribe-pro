#!/bin/bash

# Script d'installation pour Ubuntu 22.04 LTS
# Certificate Manager - Gestionnaire de certificats X.509

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification que le script est exécuté en tant que root
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root (utilisez sudo)"
   exit 1
fi

log_info "Démarrage de l'installation de Certificate Manager"

# Mise à jour du système
log_info "Mise à jour du système..."
apt update && apt upgrade -y

# Installation des dépendances système
log_info "Installation des dépendances système..."
apt install -y \
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
    ufw \
    git

# Création de l'utilisateur certmanager
log_info "Création de l'utilisateur certmanager..."
if ! id "certmanager" &>/dev/null; then
    useradd -m -s /bin/bash certmanager
    log_success "Utilisateur certmanager créé"
else
    log_warning "Utilisateur certmanager existe déjà"
fi

# Création des répertoires
log_info "Création des répertoires..."
mkdir -p /opt/certificate-manager
mkdir -p /data/certs
mkdir -p /var/log/certificate-manager

# Attribution des permissions
chown -R certmanager:certmanager /opt/certificate-manager
chown -R certmanager:certmanager /data/certs
chown -R certmanager:certmanager /var/log/certificate-manager

# Clonage ou copie du code (si le script est dans le répertoire du projet)
if [ -f "backend/requirements.txt" ]; then
    log_info "Copie des fichiers du projet..."
    cp -r . /opt/certificate-manager/
    chown -R certmanager:certmanager /opt/certificate-manager
else
    log_error "Fichiers du projet non trouvés. Assurez-vous d'exécuter ce script depuis le répertoire du projet."
    exit 1
fi

# Installation des dépendances Python
log_info "Installation des dépendances Python..."
cd /opt/certificate-manager
sudo -u certmanager python3 -m venv venv
sudo -u certmanager ./venv/bin/pip install --upgrade pip
sudo -u certmanager ./venv/bin/pip install -r backend/requirements.txt

# Build du frontend
log_info "Build du frontend..."
cd /opt/certificate-manager
sudo -u certmanager npm install
sudo -u certmanager npm run build

# Copie du frontend buildé vers le répertoire static du backend
sudo -u certmanager cp -r dist/* backend/app/static/

# Installation du service systemd
log_info "Installation du service systemd..."
cp certificate-manager.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable certificate-manager

# Configuration du firewall
log_info "Configuration du firewall..."
ufw --force enable
ufw allow 8080/tcp
ufw allow ssh

# Création du fichier de configuration
log_info "Création du fichier de configuration..."
cat > /opt/certificate-manager/.env << EOF
# Configuration Certificate Manager
CERTS_DIR=/data/certs
PORT=8080
HOST=0.0.0.0
SCAN_INTERVAL_SEC=300
THRESHOLD_DAYS=30
SECRET_KEY=$(openssl rand -hex 32)

# Authentification (décommentez et configurez selon vos besoins)
# AUTH_TOKEN=your-secret-token-here
# BASIC_USER=admin
# BASIC_PASS=your-password-here
EOF

chown certmanager:certmanager /opt/certificate-manager/.env
chmod 600 /opt/certificate-manager/.env

# Démarrage du service
log_info "Démarrage du service..."
systemctl start certificate-manager

# Vérification du statut
sleep 5
if systemctl is-active --quiet certificate-manager; then
    log_success "Service démarré avec succès"
else
    log_error "Échec du démarrage du service"
    systemctl status certificate-manager
    exit 1
fi

# Test de l'API
log_info "Test de l'API..."
sleep 10
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    log_success "API accessible et fonctionnelle"
else
    log_warning "API non accessible, vérifiez les logs: journalctl -u certificate-manager -f"
fi

log_success "Installation terminée avec succès!"
echo ""
echo "=== INFORMATIONS IMPORTANTES ==="
echo "• Service: certificate-manager"
echo "• Port: 8080"
echo "• Répertoire des certificats: /data/certs"
echo "• Interface web: http://localhost:8080"
echo "• Logs: journalctl -u certificate-manager -f"
echo ""
echo "=== COMMANDES UTILES ==="
echo "• Démarrer: systemctl start certificate-manager"
echo "• Arrêter: systemctl stop certificate-manager"
echo "• Redémarrer: systemctl restart certificate-manager"
echo "• Statut: systemctl status certificate-manager"
echo "• Logs: journalctl -u certificate-manager -f"
echo ""
echo "=== CONFIGURATION ==="
echo "• Fichier de config: /opt/certificate-manager/.env"
echo "• Modifiez les paramètres selon vos besoins"
echo "• Redémarrez le service après modification: systemctl restart certificate-manager"
echo ""
echo "=== SÉCURITÉ ==="
echo "• Configurez l'authentification dans /opt/certificate-manager/.env"
echo "• Changez le SECRET_KEY en production"
echo "• Configurez un reverse proxy (nginx) pour HTTPS"
echo ""
