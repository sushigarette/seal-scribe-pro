import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Certificate } from "./CertificateListItem";
import { Calendar, Shield, Building2, Download, Key, Globe, User } from "lucide-react";

interface CertificateDetailProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (id: string) => void;
}

const getStatusColor = (status: Certificate["status"]) => {
  switch (status) {
    case "valid":
      return "bg-success text-success-foreground";
    case "expiring":
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
    case "expiring":
      return "Expire bientôt";
    case "expired":
      return "Expiré";
    default:
      return "Inconnu";
  }
};

export const CertificateDetail = ({ certificate, isOpen, onClose, onDownload }: CertificateDetailProps) => {
  if (!certificate) return null;

  // Utiliser les vraies données du certificat
  const detailData = {
    serialNumber: certificate.serialNumber,
    algorithm: "SHA256 avec RSA", // À récupérer depuis l'API si disponible
    keyLength: "2048 bits", // À récupérer depuis l'API si disponible
    fingerprint: "N/A", // À récupérer depuis l'API si disponible
    subject: certificate.distinguishedName,
    issueDate: "N/A", // À récupérer depuis l'API si disponible
    validFrom: "N/A", // À récupérer depuis l'API si disponible
    validTo: certificate.expirationDate,
    domains: [certificate.name], // Simplifié pour l'instant
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
              {certificate.name}
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
                <span className="text-sm font-medium text-muted-foreground">Type</span>
                <p className="text-sm">{certificate.type}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Numéro de série</span>
                <p className="text-sm font-mono">{detailData.serialNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Taille du fichier</span>
                <p className="text-sm">{certificate.fileSize}</p>
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
                <span className="text-sm font-medium text-muted-foreground">Empreinte SHA-1</span>
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
              onClick={() => onDownload(certificate.id)}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le certificat
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