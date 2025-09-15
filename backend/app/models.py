from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Certificate(BaseModel):
    id: int
    archive_name: str
    file_path: str
    subject_cn: str
    subject_dn: str
    issuer: str
    issuer_dn: str
    not_before: str
    not_after: str
    days_to_expiry: int
    status: str  # 'valid', 'expiring_soon', 'expired'
    fingerprint_sha256: str
    fingerprint_sha1: str
    algorithm: str
    key_length: int
    domains: str
    file_size: int
    last_modified: str
    is_valid: bool

class CertificateListResponse(BaseModel):
    certificates: List[Certificate]
    pagination: Dict[str, Any]

class CertificateDetailsResponse(BaseModel):
    archive_name: str
    certificates: List[Certificate]

class StatsResponse(BaseModel):
    total: int
    valid: int
    expiring_soon: int
    expired: int
    issuers: List[Dict[str, Any]]

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    external_api_status: str
    certificates_count: int

