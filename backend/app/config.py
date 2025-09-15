from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Configuration de l'API externe
    external_api_url: str = "https://office.mhcomm.fr/crtinfo/certindex.json"
    
    # Certificats client
    client_cert_path: Optional[str] = None
    client_key_path: Optional[str] = None
    ca_cert_path: Optional[str] = None
    
    # Configuration du serveur
    host: str = "0.0.0.0"
    port: int = 8080
    debug: bool = False
    
    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8081"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

# Configuration des certificats depuis les variables d'environnement
if not settings.client_cert_path:
    settings.client_cert_path = os.getenv("CLIENT_CERT_PATH")
if not settings.client_key_path:
    settings.client_key_path = os.getenv("CLIENT_KEY_PATH")
if not settings.ca_cert_path:
    settings.ca_cert_path = os.getenv("CA_CERT_PATH")

