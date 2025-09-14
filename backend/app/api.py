from fastapi import APIRouter, Depends, HTTPException, Query, Response, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional
import os
import logging
from datetime import datetime

from .database import get_db
from .models import Certificate
from .auth import get_auth_dependency
from .config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Dépendance d'authentification
auth_dependency = get_auth_dependency()

@router.get("/health")
async def health_check():
    """Vérification de l'état de l'application"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@router.get("/certs")
async def get_certificates(
    page: int = Query(1, ge=1, description="Numéro de page"),
    size: int = Query(20, ge=1, le=100, description="Taille de la page"),
    search: Optional[str] = Query(None, description="Recherche dans le nom, CN, émetteur"),
    status_filter: Optional[str] = Query(None, description="Filtre par statut (valid, expiring_soon, expired)"),
    issuer_filter: Optional[str] = Query(None, description="Filtre par émetteur"),
    sort_by: str = Query("not_after", description="Champ de tri"),
    sort_order: str = Query("asc", description="Ordre de tri (asc, desc)"),
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(auth_dependency)
):
    """Récupère la liste paginée des certificats avec filtres"""
    
    # Construction de la requête
    query = db.query(Certificate).filter(Certificate.is_valid == True)
    
    # Filtres
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Certificate.archive_name.ilike(search_term),
                Certificate.subject_cn.ilike(search_term),
                Certificate.issuer.ilike(search_term)
            )
        )
    
    if status_filter:
        query = query.filter(Certificate.status == status_filter)
    
    if issuer_filter:
        query = query.filter(Certificate.issuer.ilike(f"%{issuer_filter}%"))
    
    # Tri
    sort_column = getattr(Certificate, sort_by, Certificate.not_after)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Pagination
    total = query.count()
    certificates = query.offset((page - 1) * size).limit(size).all()
    
    return {
        "certificates": [cert.to_dict() for cert in certificates],
        "pagination": {
            "page": page,
            "size": size,
            "total": total,
            "pages": (total + size - 1) // size
        }
    }

@router.get("/certs/{archive_name}")
async def get_certificate_details(
    archive_name: str,
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(auth_dependency)
):
    """Récupère les détails d'un certificat par nom d'archive"""
    
    certificates = db.query(Certificate).filter(
        and_(
            Certificate.archive_name == archive_name,
            Certificate.is_valid == True
        )
    ).all()
    
    if not certificates:
        raise HTTPException(status_code=404, detail="Certificat non trouvé")
    
    return {
        "archive_name": archive_name,
        "certificates": [cert.to_dict() for cert in certificates]
    }

@router.get("/certs/{archive_name}/download")
async def download_certificate(
    archive_name: str,
    request: Request,
    _: Optional[str] = Depends(auth_dependency)
):
    """Télécharge l'archive tar.gz d'un certificat"""
    
    # Sécurité : vérifier que le nom ne contient pas de path traversal
    if ".." in archive_name or "/" in archive_name or "\\" in archive_name:
        raise HTTPException(status_code=400, detail="Nom d'archive invalide")
    
    file_path = os.path.join(settings.certs_dir, f"{archive_name}.tar.gz")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archive non trouvée")
    
    # Log du téléchargement
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"Téléchargement de {archive_name}.tar.gz par {client_ip}")
    
    return FileResponse(
        path=file_path,
        filename=f"{archive_name}.tar.gz",
        media_type="application/gzip"
    )

@router.get("/stats")
async def get_stats(
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(auth_dependency)
):
    """Récupère les statistiques des certificats"""
    
    total = db.query(Certificate).filter(Certificate.is_valid == True).count()
    valid = db.query(Certificate).filter(
        and_(Certificate.is_valid == True, Certificate.status == "valid")
    ).count()
    expiring_soon = db.query(Certificate).filter(
        and_(Certificate.is_valid == True, Certificate.status == "expiring_soon")
    ).count()
    expired = db.query(Certificate).filter(
        and_(Certificate.is_valid == True, Certificate.status == "expired")
    ).count()
    
    # Statistiques par émetteur
    issuers = db.query(Certificate.issuer, db.func.count(Certificate.id)).filter(
        Certificate.is_valid == True
    ).group_by(Certificate.issuer).all()
    
    return {
        "total": total,
        "valid": valid,
        "expiring_soon": expiring_soon,
        "expired": expired,
        "issuers": [{"name": issuer, "count": count} for issuer, count in issuers]
    }

@router.post("/rescan")
async def rescan_certificates(
    _: Optional[str] = Depends(auth_dependency)
):
    """Force un nouveau scan des certificats"""
    # Cette fonction sera appelée par le file watcher
    from .file_watcher import CertificateWatcher
    watcher = CertificateWatcher()
    watcher.rescan()
    return {"message": "Rescan initié"}

@router.get("/export/csv")
async def export_csv(
    status_filter: Optional[str] = Query(None, description="Filtre par statut"),
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(auth_dependency)
):
    """Exporte la liste des certificats en CSV"""
    import csv
    import io
    
    query = db.query(Certificate).filter(Certificate.is_valid == True)
    
    if status_filter:
        query = query.filter(Certificate.status == status_filter)
    
    certificates = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # En-têtes
    writer.writerow([
        "Archive Name", "Subject CN", "Issuer", "Not Before", "Not After",
        "Days to Expiry", "Status", "Fingerprint SHA256", "Algorithm", "Key Length", "Domains"
    ])
    
    # Données
    for cert in certificates:
        domains = cert.domains if cert.domains else ""
        writer.writerow([
            cert.archive_name,
            cert.subject_cn or "",
            cert.issuer or "",
            cert.not_before.isoformat() if cert.not_before else "",
            cert.not_after.isoformat() if cert.not_after else "",
            cert.days_to_expiry or 0,
            cert.status or "",
            cert.fingerprint_sha256 or "",
            cert.algorithm or "",
            cert.key_length or "",
            domains
        ])
    
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=certificates.csv"}
    )

@router.get("/export/json")
async def export_json(
    status_filter: Optional[str] = Query(None, description="Filtre par statut"),
    db: Session = Depends(get_db),
    _: Optional[str] = Depends(auth_dependency)
):
    """Exporte la liste des certificats en JSON"""
    import json
    
    query = db.query(Certificate).filter(Certificate.is_valid == True)
    
    if status_filter:
        query = query.filter(Certificate.status == status_filter)
    
    certificates = query.all()
    
    return Response(
        content=json.dumps([cert.to_dict() for cert in certificates], indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=certificates.json"}
    )
