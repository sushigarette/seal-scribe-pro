from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Répertoire des certificats
    certs_dir: str = os.getenv("CERTS_DIR", "/data/certs")
    
    # Configuration serveur
    port: int = int(os.getenv("PORT", "8080"))
    host: str = os.getenv("HOST", "0.0.0.0")
    
    # Authentification
    auth_token: Optional[str] = os.getenv("AUTH_TOKEN")
    basic_user: Optional[str] = os.getenv("BASIC_USER")
    basic_pass: Optional[str] = os.getenv("BASIC_PASS")
    
    # Configuration du scan
    scan_interval_sec: int = int(os.getenv("SCAN_INTERVAL_SEC", "300"))
    threshold_days: int = int(os.getenv("THRESHOLD_DAYS", "30"))
    
    # Base de données
    database_url: str = "sqlite:///./certificates.db"
    
    # Sécurité
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    class Config:
        env_file = ".env"

settings = Settings()
