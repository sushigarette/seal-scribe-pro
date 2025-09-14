from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

from .config import settings
from .database import init_db
from .api import router as api_router
from .file_watcher import CertificateWatcher

# Configuration des logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Métriques Prometheus
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

# Instance globale du watcher
watcher = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestionnaire de cycle de vie de l'application"""
    global watcher
    
    # Initialisation
    logger.info("Démarrage de l'application Certificate Manager")
    
    # Initialisation de la base de données
    init_db()
    logger.info("Base de données initialisée")
    
    # Démarrage du file watcher
    watcher = CertificateWatcher()
    watcher.start()
    logger.info("File watcher démarré")
    
    yield
    
    # Nettoyage
    if watcher:
        watcher.stop()
        logger.info("File watcher arrêté")
    
    logger.info("Arrêt de l'application")

# Création de l'application FastAPI
app = FastAPI(
    title="Certificate Manager",
    description="Gestionnaire de certificats X.509",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de sécurité
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # En production, spécifier les hôtes autorisés
)

# Middleware de métriques
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Middleware pour collecter les métriques"""
    import time
    
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_DURATION.observe(duration)
    
    return response

# Middleware de sécurité des en-têtes
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Ajoute des en-têtes de sécurité"""
    response = await call_next(request)
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response

# Inclusion des routes API
app.include_router(api_router, prefix="/api/v1")

# Route pour les métriques Prometheus
@app.get("/metrics")
async def metrics():
    """Endpoint pour les métriques Prometheus"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Route pour servir les fichiers statiques (frontend)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Route racine
@app.get("/")
async def root():
    """Page d'accueil"""
    return {
        "message": "Certificate Manager API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

# Route de santé globale
@app.get("/health")
async def health():
    """Vérification de l'état de l'application"""
    return {"status": "ok", "service": "certificate-manager"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level="info"
    )
