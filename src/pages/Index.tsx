import { useState } from "react";
import { CertificateListItem, Certificate } from "@/components/CertificateListItem";
import { CertificateFilters } from "@/components/CertificateFilters";
import { CertificateDetail } from "@/components/CertificateDetail";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - in real app, this would come from API
const mockCertificates: Certificate[] = [
  {
    id: "1",
    name: "Certificat SSL exemple.com",
    issuer: "Let's Encrypt",
    expirationDate: "15/03/2025",
    status: "valid",
    type: "SSL/TLS",
    fileSize: "2.1 KB"
  },
  {
    id: "2", 
    name: "Certificat Code Signing",
    issuer: "DigiCert",
    expirationDate: "28/02/2025",
    status: "expiring",
    type: "Code Signing",
    fileSize: "4.8 KB"
  },
  {
    id: "3",
    name: "Certificat Email Sécurisé",
    issuer: "Comodo",
    expirationDate: "10/01/2025",
    status: "expired",
    type: "Email",
    fileSize: "1.9 KB"
  },
  {
    id: "4",
    name: "Certificat Client VPN",
    issuer: "GlobalSign",
    expirationDate: "20/06/2025",
    status: "valid",
    type: "Client",
    fileSize: "3.2 KB"
  },
  {
    id: "5",
    name: "Certificat Wildcard *.monsite.fr",
    issuer: "Sectigo",
    expirationDate: "05/04/2025",
    status: "valid",
    type: "SSL/TLS",
    fileSize: "2.7 KB"
  },
  {
    id: "6",
    name: "Certificat API Interne",
    issuer: "Autorité Interne",
    expirationDate: "12/02/2025",
    status: "expiring",
    type: "SSL/TLS",
    fileSize: "1.8 KB"
  }
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const filteredCertificates = mockCertificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesType = typeFilter === "all" || cert.type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDownload = (id: string) => {
    const cert = mockCertificates.find(c => c.id === id);
    toast({
      title: "Téléchargement initié",
      description: `Le certificat "${cert?.name}" est en cours de téléchargement.`,
    });
  };

  const handleView = (id: string) => {
    const cert = mockCertificates.find(c => c.id === id);
    setSelectedCertificate(cert || null);
    setIsDetailOpen(true);
  };

  const getStatusCounts = () => {
    return {
      total: mockCertificates.length,
      valid: mockCertificates.filter(c => c.status === "valid").length,
      expiring: mockCertificates.filter(c => c.status === "expiring").length,
      expired: mockCertificates.filter(c => c.status === "expired").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Gestion des Certificats</h1>
                <p className="text-muted-foreground">
                  Gérez et surveillez vos certificats numériques
                </p>
              </div>
            </div>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-card">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau certificat
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-card rounded-lg border shadow-subtle">
              <div className="text-2xl font-bold text-foreground">{statusCounts.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="p-4 bg-card rounded-lg border shadow-subtle">
              <div className="text-2xl font-bold text-success">{statusCounts.valid}</div>
              <div className="text-sm text-muted-foreground">Valides</div>
            </div>
            <div className="p-4 bg-card rounded-lg border shadow-subtle">
              <div className="text-2xl font-bold text-warning">{statusCounts.expiring}</div>
              <div className="text-sm text-muted-foreground">Expirent bientôt</div>
            </div>
            <div className="p-4 bg-card rounded-lg border shadow-subtle">
              <div className="text-2xl font-bold text-destructive">{statusCounts.expired}</div>
              <div className="text-sm text-muted-foreground">Expirés</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CertificateFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {/* Certificates List */}
        <div className="mt-8">
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun certificat trouvé</h3>
              <p className="text-muted-foreground">
                Aucun certificat ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCertificates.map((certificate) => (
                <CertificateListItem
                  key={certificate.id}
                  certificate={certificate}
                  onDownload={handleDownload}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </div>

        {/* Certificate Detail Modal */}
        <CertificateDetail
          certificate={selectedCertificate}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default Index;
