import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download, Eye, Calendar, Shield, Building2 } from "lucide-react";

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  expirationDate: string;
  status: "valid" | "expiring" | "expired";
  type: string;
  fileSize: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  onDownload: (id: string) => void;
  onView: (id: string) => void;
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

export const CertificateCard = ({ certificate, onDownload, onView }: CertificateCardProps) => {
  return (
    <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {certificate.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Building2 className="h-3 w-3" />
                {certificate.issuer}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(certificate.status)}>
            {getStatusText(certificate.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Expire le {certificate.expirationDate}</span>
          </div>
          <div className="text-muted-foreground">
            Type: {certificate.type}
          </div>
          <div className="text-muted-foreground col-span-2">
            Taille: {certificate.fileSize}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(certificate.id)}
            className="flex-1 group-hover:border-primary/50 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir détails
          </Button>
          <Button
            size="sm"
            onClick={() => onDownload(certificate.id)}
            className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};