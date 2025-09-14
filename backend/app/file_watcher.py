import os
import time
import logging
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from typing import Callable, Set
from .cert_parser import CertificateParser
from .database import SessionLocal
from .models import Certificate
from .config import settings

logger = logging.getLogger(__name__)

class CertificateFileHandler(FileSystemEventHandler):
    def __init__(self, on_certificate_change: Callable):
        self.on_certificate_change = on_certificate_change
        self.processed_files: Set[str] = set()
    
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.tar.gz'):
            self._process_file(event.src_path)
    
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.tar.gz'):
            self._process_file(event.src_path)
    
    def on_deleted(self, event):
        if not event.is_directory and event.src_path.endswith('.tar.gz'):
            self._remove_certificates(event.src_path)
    
    def _process_file(self, file_path: str):
        """Traite un fichier d'archive"""
        try:
            # Éviter les traitements multiples du même fichier
            if file_path in self.processed_files:
                return
            
            self.processed_files.add(file_path)
            
            # Vérifier que le fichier existe et n'est pas en cours d'écriture
            if not os.path.exists(file_path):
                return
            
            # Attendre un peu pour s'assurer que le fichier est complètement écrit
            time.sleep(1)
            
            if os.path.exists(file_path):
                self.on_certificate_change(file_path, 'add_or_update')
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement du fichier {file_path}: {e}")
        finally:
            self.processed_files.discard(file_path)
    
    def _remove_certificates(self, file_path: str):
        """Supprime les certificats d'une archive supprimée"""
        try:
            archive_name = os.path.basename(file_path).replace('.tar.gz', '')
            self.on_certificate_change(archive_name, 'remove')
        except Exception as e:
            logger.error(f"Erreur lors de la suppression des certificats pour {file_path}: {e}")

class CertificateWatcher:
    def __init__(self):
        self.parser = CertificateParser(settings.threshold_days)
        self.observer = None
        self.is_running = False
    
    def start(self):
        """Démarre la surveillance des fichiers"""
        if self.is_running:
            return
        
        certs_dir = Path(settings.certs_dir)
        if not certs_dir.exists():
            logger.error(f"Le répertoire {settings.certs_dir} n'existe pas")
            return
        
        # Scan initial
        self._scan_all_certificates()
        
        # Configuration du watcher
        event_handler = CertificateFileHandler(self._handle_certificate_change)
        self.observer = Observer()
        self.observer.schedule(event_handler, str(certs_dir), recursive=False)
        
        # Démarrage
        self.observer.start()
        self.is_running = True
        logger.info(f"Surveillance des certificats démarrée sur {settings.certs_dir}")
    
    def stop(self):
        """Arrête la surveillance des fichiers"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
        self.is_running = False
        logger.info("Surveillance des certificats arrêtée")
    
    def _scan_all_certificates(self):
        """Scanne tous les certificats existants"""
        certs_dir = Path(settings.certs_dir)
        tar_files = list(certs_dir.glob("*.tar.gz"))
        
        logger.info(f"Scan initial de {len(tar_files)} archives")
        
        for tar_file in tar_files:
            try:
                self._handle_certificate_change(str(tar_file), 'add_or_update')
            except Exception as e:
                logger.error(f"Erreur lors du scan de {tar_file}: {e}")
    
    def _handle_certificate_change(self, file_path_or_name: str, action: str):
        """Gère les changements de certificats"""
        try:
            if action == 'remove':
                self._remove_certificates_from_db(file_path_or_name)
            else:
                self._add_or_update_certificates(file_path_or_name)
        except Exception as e:
            logger.error(f"Erreur lors du traitement {action} pour {file_path_or_name}: {e}")
    
    def _add_or_update_certificates(self, file_path: str):
        """Ajoute ou met à jour les certificats d'une archive"""
        if not os.path.exists(file_path):
            return
        
        # Parser l'archive
        certificates = self.parser.parse_archive(file_path)
        
        if not certificates:
            logger.warning(f"Aucun certificat trouvé dans {file_path}")
            return
        
        # Mettre à jour la base de données
        db = SessionLocal()
        try:
            archive_name = os.path.basename(file_path).replace('.tar.gz', '')
            
            # Supprimer les anciens certificats de cette archive
            db.query(Certificate).filter(Certificate.archive_name == archive_name).delete()
            
            # Ajouter les nouveaux certificats
            for cert_data in certificates:
                cert = Certificate(**cert_data)
                db.add(cert)
            
            db.commit()
            logger.info(f"Mis à jour {len(certificates)} certificats pour {archive_name}")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erreur lors de la mise à jour de la base de données: {e}")
        finally:
            db.close()
    
    def _remove_certificates_from_db(self, archive_name: str):
        """Supprime les certificats d'une archive de la base de données"""
        db = SessionLocal()
        try:
            deleted_count = db.query(Certificate).filter(Certificate.archive_name == archive_name).delete()
            db.commit()
            logger.info(f"Supprimé {deleted_count} certificats pour {archive_name}")
        except Exception as e:
            db.rollback()
            logger.error(f"Erreur lors de la suppression des certificats: {e}")
        finally:
            db.close()
    
    def rescan(self):
        """Force un nouveau scan de tous les certificats"""
        logger.info("Rescan forcé des certificats")
        self._scan_all_certificates()
