import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Certificate } from "./CertificateListItem";
import { Calendar, Shield, Building2, Download, Key, Globe, User } from "lucide-react";

interface CertificateDetailProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (archiveName: string) => void;
}

const getStatusColor = (status: Certificate["status"]) => {
  switch (status) {
    case "valid":
      return "bg-success text-success-foreground";
    case "expiring_soon":
      return "bg-warning text-warning-foreground";
    case "expired":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusText = (status: Certificate["status"]) => {
  switch (status) {
    case "valid":
      return "Valide";
    case "expiring_soon":
      return "Expire bientôt";
    case "expired":
      return "Expiré";
    default:
      return "Inconnu";
  }
};

export const CertificateDetail = ({ certificate, isOpen, onClose, onDownload }: CertificateDetailProps) => {
  if (!certificate) return null;

  // Utiliser les données réelles du certificat
  const detailData = {
    serialNumber: certificate.fingerprint_sha1 || "N/A",
    algorithm: certificate.algorithm || "N/A",
    keyLength: certificate.key_length ? `${certificate.key_length} bits` : "N/A",
    fingerprint: certificate.fingerprint_sha256 || "N/A",
    subject: certificate.subject_dn || certificate.subject_cn || "N/A",
    issueDate: new Date(certificate.not_before).toLocaleDateString('fr-FR'),
    validFrom: new Date(certificate.not_before).toLocaleDateString('fr-FR'),
    validTo: new Date(certificate.not_after).toLocaleDateString('fr-FR'),
    domains: certificate.domains ? JSON.parse(certificate.domains) : [],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              {certificate.archive_name}
            </DialogTitle>
            <Badge className={getStatusColor(certificate.status)}>
              {getStatusText(certificate.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations générales
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Émetteur</span>
                <p className="text-sm">{certificate.issuer}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">CN (Common Name)</span>
                <p className="text-sm">{certificate.subject_cn}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Empreinte SHA-1</span>
                <p className="text-sm font-mono">{detailData.serialNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Taille du fichier</span>
                <p className="text-sm">{(certificate.file_size / 1024).toFixed(1)} KB</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Jours restants</span>
                <p className="text-sm">{certificate.days_to_expiry} jours</p>
              </div>
            </div>
          </div>

          {/* Validité */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Période de validité
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Valide depuis</span>
                <p className="text-sm">{detailData.validFrom}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Expire le</span>
                <p className="text-sm">{detailData.validTo}</p>
              </div>
            </div>
          </div>

          {/* Détails cryptographiques */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Key className="h-5 w-5" />
              Détails cryptographiques
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Algorithme</span>
                <p className="text-sm">{detailData.algorithm}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Longueur de clé</span>
                <p className="text-sm">{detailData.keyLength}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-medium text-muted-foreground">Empreinte SHA-256</span>
                <p className="text-sm font-mono break-all">{detailData.fingerprint}</p>
              </div>
            </div>
          </div>

          {/* Sujet */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5" />
              Sujet du certificat
            </h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-mono break-all">{detailData.subject}</p>
            </div>
          </div>

          {/* Domaines */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domaines couverts
            </h3>
            <div className="flex flex-wrap gap-2">
              {detailData.domains.map((domain, index) => (
                <Badge key={index} variant="outline" className="font-mono">
                  {domain}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => onDownload(certificate.archive_name)}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger l'archive
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};