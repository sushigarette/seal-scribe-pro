#!/bin/bash

# Script de génération d'archives de démonstration
# Génère des certificats de test pour tester l'application

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Répertoire de destination
CERTS_DIR=${1:-"./demo-certs"}
mkdir -p "$CERTS_DIR"

log_info "Génération d'archives de démonstration dans $CERTS_DIR"

# Fonction pour générer un certificat de test
generate_cert() {
    local name=$1
    local domain=$2
    local days=$3
    local issuer=$4
    
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Génération de la clé privée
    openssl genrsa -out private.key 2048
    
    # Génération du certificat
    openssl req -new -x509 -key private.key -out certs/cert.crt -days $days -subj "/C=FR/ST=France/L=Paris/O=$issuer/CN=$domain"
    
    # Création de l'archive
    tar -czf "$CERTS_DIR/$name.tar.gz" certs/ private/
    
    cd - > /dev/null
    rm -rf "$temp_dir"
    
    log_success "Généré: $name.tar.gz (expire dans $days jours)"
}

# Génération des certificats de démonstration
log_info "Génération des certificats de test..."

# Certificat valide (expire dans 365 jours)
generate_cert "exemple-com" "exemple.com" 365 "Let's Encrypt"

# Certificat qui expire bientôt (expire dans 15 jours)
generate_cert "api-monsite" "api.monsite.fr" 15 "DigiCert"

# Certificat expiré (expire dans -30 jours)
generate_cert "old-cert" "old.example.com" -30 "Comodo"

# Certificat wildcard
generate_cert "wildcard-site" "*.monsite.fr" 200 "Sectigo"

# Certificat avec SANs
generate_cert "multi-domain" "main.example.com" 180 "GlobalSign"

# Certificat de code signing
generate_cert "code-signing" "signing.example.com" 90 "DigiCert"

# Certificat interne
generate_cert "internal-api" "internal.company.local" 60 "Autorité Interne"

log_success "Génération terminée!"
echo ""
echo "Archives générées dans: $CERTS_DIR"
echo "Vous pouvez maintenant:"
echo "1. Copier ces archives vers votre répertoire de surveillance:"
echo "   cp $CERTS_DIR/*.tar.gz /data/certs/"
echo "2. Ou configurer l'application pour surveiller: $CERTS_DIR"
echo ""
echo "Structure des archives:"
echo "  NOM.tar.gz"
echo "  ├── certs/"
echo "  │   └── cert.crt"
echo "  └── private/"
echo "      └── private.key"
