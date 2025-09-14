from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPBasic, HTTPBasicCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from .config import settings
import secrets

# Configuration de l'authentification
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)
basic_security = HTTPBasic(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

def verify_token(token: str) -> bool:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return True
    except JWTError:
        return False

async def get_current_user_token(token: str = Depends(security)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'authentification requis",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_token(token.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token.credentials

async def get_current_user_basic(credentials: HTTPBasicCredentials = Depends(basic_security)):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    if not settings.basic_user or not settings.basic_pass:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentification basique non configurée",
        )
    
    # Vérification des credentials
    is_correct_username = secrets.compare_digest(credentials.username, settings.basic_user)
    is_correct_password = secrets.compare_digest(credentials.password, settings.basic_pass)
    
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return credentials

def get_auth_dependency():
    """Retourne la dépendance d'authentification appropriée"""
    if settings.auth_token:
        return get_current_user_token
    elif settings.basic_user and settings.basic_pass:
        return get_current_user_basic
    else:
        # Pas d'authentification configurée
        return lambda: None
