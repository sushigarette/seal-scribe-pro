#!/bin/bash

# Script de test de l'API Certificate Manager

set -e

# Configuration
API_URL=${1:-"http://localhost:8080"}
AUTH_TOKEN=${2:-""}

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour faire une requête API
api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    local curl_cmd="curl -s -w '%{http_code}' -X $method"
    
    if [ -n "$AUTH_TOKEN" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $AUTH_TOKEN'"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$API_URL$endpoint'"
    
    eval $curl_cmd
}

# Test de santé
test_health() {
    log_info "Test de santé de l'API..."
    
    local response=$(api_request "GET" "/health")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        log_success "API accessible (HTTP $status_code)"
        echo "Réponse: $body"
    else
        log_error "API non accessible (HTTP $status_code)"
        return 1
    fi
}

# Test des statistiques
test_stats() {
    log_info "Test des statistiques..."
    
    local response=$(api_request "GET" "/api/v1/stats")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        log_success "Statistiques récupérées (HTTP $status_code)"
        echo "Réponse: $body"
    else
        log_error "Erreur lors de la récupération des statistiques (HTTP $status_code)"
        return 1
    fi
}

# Test de la liste des certificats
test_certificates() {
    log_info "Test de la liste des certificats..."
    
    local response=$(api_request "GET" "/api/v1/certs?page=1&size=10")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        log_success "Liste des certificats récupérée (HTTP $status_code)"
        echo "Réponse: $body"
    else
        log_error "Erreur lors de la récupération des certificats (HTTP $status_code)"
        return 1
    fi
}

# Test de rescan
test_rescan() {
    log_info "Test du rescan..."
    
    local response=$(api_request "POST" "/api/v1/rescan")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        log_success "Rescan effectué (HTTP $status_code)"
        echo "Réponse: $body"
    else
        log_error "Erreur lors du rescan (HTTP $status_code)"
        return 1
    fi
}

# Test des métriques
test_metrics() {
    log_info "Test des métriques Prometheus..."
    
    local response=$(api_request "GET" "/metrics")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        log_success "Métriques récupérées (HTTP $status_code)"
        echo "Métriques disponibles:"
        echo "$body" | grep -E "^# HELP|^# TYPE" | head -10
    else
        log_error "Erreur lors de la récupération des métriques (HTTP $status_code)"
        return 1
    fi
}

# Test d'export CSV
test_export_csv() {
    log_info "Test d'export CSV..."
    
    local response=$(api_request "GET" "/api/v1/export/csv")
    local status_code="${response: -3}"
    
    if [ "$status_code" = "200" ]; then
        log_success "Export CSV réussi (HTTP $status_code)"
    else
        log_error "Erreur lors de l'export CSV (HTTP $status_code)"
        return 1
    fi
}

# Test d'export JSON
test_export_json() {
    log_info "Test d'export JSON..."
    
    local response=$(api_request "GET" "/api/v1/export/json")
    local status_code="${response: -3}"
    
    if [ "$status_code" = "200" ]; then
        log_success "Export JSON réussi (HTTP $status_code)"
    else
        log_error "Erreur lors de l'export JSON (HTTP $status_code)"
        return 1
    fi
}

# Fonction principale
main() {
    echo "=== Test de l'API Certificate Manager ==="
    echo "URL: $API_URL"
    echo "Token: ${AUTH_TOKEN:-"Aucun"}"
    echo ""
    
    local tests_passed=0
    local tests_total=0
    
    # Exécution des tests
    tests=(
        "test_health"
        "test_stats"
        "test_certificates"
        "test_rescan"
        "test_metrics"
        "test_export_csv"
        "test_export_json"
    )
    
    for test in "${tests[@]}"; do
        tests_total=$((tests_total + 1))
        if $test; then
            tests_passed=$((tests_passed + 1))
        fi
        echo ""
    done
    
    # Résumé
    echo "=== Résumé des tests ==="
    echo "Tests réussis: $tests_passed/$tests_total"
    
    if [ $tests_passed -eq $tests_total ]; then
        log_success "Tous les tests sont passés avec succès!"
        exit 0
    else
        log_error "Certains tests ont échoué"
        exit 1
    fi
}

# Aide
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [API_URL] [AUTH_TOKEN]"
    echo ""
    echo "Exemples:"
    echo "  $0                                    # Test sur localhost:8080 sans auth"
    echo "  $0 http://localhost:8080             # Test sur localhost:8080 sans auth"
    echo "  $0 http://localhost:8080 my-token    # Test avec token d'auth"
    echo ""
    exit 0
fi

# Exécution
main
