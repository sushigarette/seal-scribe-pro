import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Calendar, Shield, Building2 } from "lucide-react";

export interface Certificate {
  id: number;
  archive_name: string;
  file_path: string;
  subject_cn: string;
  subject_dn: string;
  issuer: string;
  issuer_dn: string;
  not_before: string;
  not_after: string;
  days_to_expiry: number;
  status: "valid" | "expiring_soon" | "expired";
  fingerprint_sha256: string;
  fingerprint_sha1: string;
  algorithm: string;
  key_length: number;
  domains: string;
  file_size: number;
  last_modified: string;
  is_valid: boolean;
}

interface CertificateListItemProps {
  certificate: Certificate;
  onDownload: (archiveName: string) => void;
  onView: (archiveName: string) => void;
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

export const CertificateListItem = ({ certificate, onDownload, onView }: CertificateListItemProps) => {
  return (
    <div className="group flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-card transition-all duration-300 hover:border-primary/20">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {certificate.archive_name}
            </h3>
            <Badge className={getStatusColor(certificate.status)}>
              {getStatusText(certificate.status)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>{certificate.issuer}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Expire le {new Date(certificate.not_after).toLocaleDateString('fr-FR')}</span>
            </div>
            <span>CN: {certificate.subject_cn}</span>
            <span>Taille: {(certificate.file_size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-shrink-0 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(certificate.archive_name)}
          className="group-hover:border-primary/50 transition-colors"
        >
          <Eye className="h-4 w-4 mr-2" />
          Voir détails
        </Button>
        <Button
          size="sm"
          onClick={() => onDownload(certificate.archive_name)}
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </div>
    </div>
  );
};