import os
import tarfile
import tempfile
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.serialization import pkcs1, pkcs8
import json
import logging

logger = logging.getLogger(__name__)

class CertificateParser:
    def __init__(self, threshold_days: int = 30):
        self.threshold_days = threshold_days
    
    def parse_archive(self, archive_path: str) -> List[Dict[str, Any]]:
        """Parse une archive tar.gz et extrait les certificats"""
        certificates = []
        
        try:
            with tarfile.open(archive_path, 'r:gz') as tar:
                # Chercher tous les fichiers .crt dans le dossier certs/
                for member in tar.getmembers():
                    if member.name.endswith('.crt') and 'certs/' in member.name:
                        try:
                            # Extraire le fichier temporairement
                            file_obj = tar.extractfile(member)
                            if file_obj:
                                cert_data = file_obj.read()
                                cert_info = self.parse_certificate(cert_data, member.name)
                                if cert_info:
                                    cert_info['archive_name'] = os.path.basename(archive_path).replace('.tar.gz', '')
                                    cert_info['file_path'] = member.name
                                    cert_info['file_size'] = len(cert_data)
                                    certificates.append(cert_info)
                        except Exception as e:
                            logger.error(f"Erreur lors du parsing du certificat {member.name}: {e}")
                            continue
        except Exception as e:
            logger.error(f"Erreur lors de l'ouverture de l'archive {archive_path}: {e}")
        
        return certificates
    
    def parse_certificate(self, cert_data: bytes, filename: str) -> Optional[Dict[str, Any]]:
        """Parse un certificat X.509 et extrait les métadonnées"""
        try:
            # Essayer de parser en PEM d'abord
            try:
                cert = x509.load_pem_x509_certificate(cert_data)
            except ValueError:
                # Si ce n'est pas du PEM, essayer du DER
                cert = x509.load_der_x509_certificate(cert_data)
            
            # Informations de base
            subject = cert.subject
            issuer = cert.issuer
            
            # CN du sujet
            subject_cn = None
            for name in subject:
                if name.oid == x509.NameOID.COMMON_NAME:
                    subject_cn = name.value
                    break
            
            # CN de l'émetteur
            issuer_cn = None
            for name in issuer:
                if name.oid == x509.NameOID.COMMON_NAME:
                    issuer_cn = name.value
                    break
            
            # Dates de validité
            not_before = cert.not_valid_before
            not_after = cert.not_valid_after
            
            # Calcul des jours jusqu'à expiration
            now = datetime.now(timezone.utc)
            if not_after.tzinfo is None:
                not_after = not_after.replace(tzinfo=timezone.utc)
            
            days_to_expiry = (not_after - now).days
            status = self._get_status(days_to_expiry)
            
            # Empreintes
            fingerprint_sha256 = cert.fingerprint(hashes.SHA256()).hex()
            fingerprint_sha1 = cert.fingerprint(hashes.SHA1()).hex()
            
            # Algorithme et taille de clé
            algorithm = self._get_algorithm(cert)
            key_length = self._get_key_length(cert)
            
            # SANs (Subject Alternative Names)
            domains = self._extract_sans(cert)
            
            return {
                'subject_cn': subject_cn,
                'subject_dn': self._format_dn(subject),
                'issuer': issuer_cn,
                'issuer_dn': self._format_dn(issuer),
                'not_before': not_before,
                'not_after': not_after,
                'days_to_expiry': days_to_expiry,
                'status': status,
                'fingerprint_sha256': fingerprint_sha256,
                'fingerprint_sha1': fingerprint_sha1,
                'algorithm': algorithm,
                'key_length': key_length,
                'domains': json.dumps(domains) if domains else None,
                'is_valid': True
            }
            
        except Exception as e:
            logger.error(f"Erreur lors du parsing du certificat {filename}: {e}")
            return None
    
    def _get_status(self, days_to_expiry: int) -> str:
        """Détermine le statut du certificat"""
        if days_to_expiry < 0:
            return "expired"
        elif days_to_expiry <= self.threshold_days:
            return "expiring_soon"
        else:
            return "valid"
    
    def _get_algorithm(self, cert) -> str:
        """Extrait l'algorithme de signature"""
        try:
            sig_alg = cert.signature_algorithm_oid
            if sig_alg == x509.SignatureAlgorithmOID.RSA_WITH_MD5:
                return "RSA-MD5"
            elif sig_alg == x509.SignatureAlgorithmOID.RSA_WITH_SHA1:
                return "RSA-SHA1"
            elif sig_alg == x509.SignatureAlgorithmOID.RSA_WITH_SHA224:
                return "RSA-SHA224"
            elif sig_alg == x509.SignatureAlgorithmOID.RSA_WITH_SHA256:
                return "RSA-SHA256"
            elif sig_alg == x509.SignatureAlgorithmOID.RSA_WITH_SHA384:
                return "RSA-SHA384"
            elif sig_alg == x509.SignatureAlgorithmOID.RSA_WITH_SHA512:
                return "RSA-SHA512"
            elif sig_alg == x509.SignatureAlgorithmOID.ECDSA_WITH_SHA1:
                return "ECDSA-SHA1"
            elif sig_alg == x509.SignatureAlgorithmOID.ECDSA_WITH_SHA224:
                return "ECDSA-SHA224"
            elif sig_alg == x509.SignatureAlgorithmOID.ECDSA_WITH_SHA256:
                return "ECDSA-SHA256"
            elif sig_alg == x509.SignatureAlgorithmOID.ECDSA_WITH_SHA384:
                return "ECDSA-SHA384"
            elif sig_alg == x509.SignatureAlgorithmOID.ECDSA_WITH_SHA512:
                return "ECDSA-SHA512"
            else:
                return str(sig_alg)
        except:
            return "Unknown"
    
    def _get_key_length(self, cert) -> Optional[int]:
        """Extrait la taille de la clé publique"""
        try:
            public_key = cert.public_key()
            if hasattr(public_key, 'key_size'):
                return public_key.key_size
            return None
        except:
            return None
    
    def _extract_sans(self, cert) -> List[str]:
        """Extrait les Subject Alternative Names"""
        domains = []
        try:
            san_ext = cert.extensions.get_extension_for_oid(x509.ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
            for name in san_ext.value:
                if isinstance(name, x509.DNSName):
                    domains.append(name.value)
                elif isinstance(name, x509.IPAddress):
                    domains.append(str(name.value))
        except x509.ExtensionNotFound:
            pass
        return domains
    
    def _format_dn(self, dn) -> str:
        """Formate un Distinguished Name"""
        parts = []
        for name in dn:
            oid_name = name.oid._name if hasattr(name.oid, '_name') else str(name.oid)
            parts.append(f"{oid_name}={name.value}")
        return ", ".join(parts)
