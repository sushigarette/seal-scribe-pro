import { useState } from "react";
import { CertificateListItem, Certificate } from "@/components/CertificateListItem";
import { CertificateFilters } from "@/components/CertificateFilters";
import { CertificateDetail } from "@/components/CertificateDetail";
import { useToast } from "@/hooks/use-toast";
import { useCertificateStats } from "@/hooks/useCertificates";
import { Shield, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: certificates = [], stats, isLoading, isError, error, refetch } = useCertificateStats();

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesType = typeFilter === "all" || cert.type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDownload = (id: string) => {
    const cert = certificates.find(c => c.id === id);
    toast({
      title: "Téléchargement initié",
      description: `Le certificat "${cert?.name}" est en cours de téléchargement.`,
    });
  };

  const handleView = (id: string) => {
    const cert = certificates.find(c => c.id === id);
    setSelectedCertificate(cert || null);
    setIsDetailOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Actualisation",
      description: "Les certificats sont en cours de mise à jour...",
    });
  };

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
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="shadow-card"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-card rounded-lg border shadow-subtle">
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="p-4 bg-card rounded-lg border shadow-subtle">
              <div className="text-2xl font-bold text-success">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.valid}
              </div>
              <div className="text-sm text-muted-foreground">Valides</div>
            </div>
            <div className="p-4 bg-card rounded-lg border shadow-subtle">
              <div className="text-2xl font-bold text-warning">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.expiring}
              </div>
              <div className="text-sm text-muted-foreground">Expirent bientôt</div>
            </div>
            <div className="p-4 bg-card rounded-lg border shadow-subtle">
              <div className="text-2xl font-bold text-destructive">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.expired}
              </div>
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

        {/* Error State */}
        {isError && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erreur de chargement des certificats :</strong> {error?.message || 'Une erreur inattendue s\'est produite.'}
              <br />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Certificates List */}
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">Chargement des certificats...</h3>
              <p className="text-muted-foreground">
                Récupération des données depuis le serveur.
              </p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun certificat trouvé</h3>
              <p className="text-muted-foreground">
                {certificates.length === 0 
                  ? "Aucun certificat disponible sur le serveur."
                  : "Aucun certificat ne correspond à vos critères de recherche."
                }
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
