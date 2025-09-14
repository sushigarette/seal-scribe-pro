from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import List, Optional

Base = declarative_base()

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    archive_name = Column(String, index=True, nullable=False)
    file_path = Column(String, nullable=False)
    subject_cn = Column(String, index=True)
    subject_dn = Column(Text)
    issuer = Column(String, index=True)
    issuer_dn = Column(Text)
    not_before = Column(DateTime)
    not_after = Column(DateTime)
    days_to_expiry = Column(Integer)
    status = Column(String)  # valid, expiring_soon, expired
    fingerprint_sha256 = Column(String, index=True)
    fingerprint_sha1 = Column(String)
    algorithm = Column(String)
    key_length = Column(Integer)
    domains = Column(Text)  # JSON string des SANs
    file_size = Column(Integer)
    last_modified = Column(DateTime, default=datetime.utcnow)
    is_valid = Column(Boolean, default=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "archive_name": self.archive_name,
            "file_path": self.file_path,
            "subject_cn": self.subject_cn,
            "subject_dn": self.subject_dn,
            "issuer": self.issuer,
            "issuer_dn": self.issuer_dn,
            "not_before": self.not_before.isoformat() if self.not_before else None,
            "not_after": self.not_after.isoformat() if self.not_after else None,
            "days_to_expiry": self.days_to_expiry,
            "status": self.status,
            "fingerprint_sha256": self.fingerprint_sha256,
            "fingerprint_sha1": self.fingerprint_sha1,
            "algorithm": self.algorithm,
            "key_length": self.key_length,
            "domains": self.domains,
            "file_size": self.file_size,
            "last_modified": self.last_modified.isoformat() if self.last_modified else None,
            "is_valid": self.is_valid
        }
