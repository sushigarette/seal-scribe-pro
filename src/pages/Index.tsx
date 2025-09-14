import { useState, useEffect } from "react";
import { CertificateListItem, Certificate } from "@/components/CertificateListItem";
import { CertificateFilters } from "@/components/CertificateFilters";
import { CertificateDetail } from "@/components/CertificateDetail";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, RefreshCw, Download, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCertificates } from "@/hooks/useCertificates";
import { apiService } from "@/services/api";

const Index = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("not_after");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  
  const { toast } = useToast();

  const {
    certificates,
    pagination,
    stats,
    loading,
    error,
    refetch,
    setPage: setPageHook,
    setSearch,
    setStatusFilter: setStatusFilterHook,
    setIssuerFilter,
    setSorting,
    downloadCertificate,
    rescanCertificates,
    exportCsv,
    exportJson,
  } = useCertificates({
    page,
    search: searchTerm,
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
    sortBy,
    sortOrder,
  });

  // Synchroniser les changements de page
  useEffect(() => {
    setPageHook(page);
  }, [page, setPageHook]);

  // Synchroniser les changements de recherche
  useEffect(() => {
    setSearch(searchTerm);
  }, [searchTerm, setSearch]);

  // Synchroniser les changements de filtre de statut
  useEffect(() => {
    setStatusFilterHook(statusFilter === "all" ? undefined : statusFilter);
  }, [statusFilter, setStatusFilterHook]);

  // Synchroniser les changements de tri
  useEffect(() => {
    setSorting(sortBy, sortOrder);
  }, [sortBy, sortOrder, setSorting]);

  const handleDownload = async (archiveName: string) => {
    try {
      await downloadCertificate(archiveName);
      toast({
        title: "Téléchargement initié",
        description: `L'archive "${archiveName}.tar.gz" est en cours de téléchargement.`,
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    }
  };

  const handleView = async (archiveName: string) => {
    try {
      const details = await apiService.getCertificateDetails(archiveName);
      if (details.certificates.length > 0) {
        setSelectedCertificate(details.certificates[0]);
        setIsDetailOpen(true);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du certificat",
        variant: "destructive",
      });
    }
  };

  const handleRescan = async () => {
    try {
      await rescanCertificates();
      toast({
        title: "Rescan effectué",
        description: "Les certificats ont été mis à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur de rescan",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    }
  };

  const handleExportCsv = async () => {
    try {
      await exportCsv(statusFilter === "all" ? undefined : statusFilter);
      toast({
        title: "Export CSV",
        description: "Le fichier CSV a été téléchargé.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    }
  };

  const handleExportJson = async () => {
    try {
      await exportJson(statusFilter === "all" ? undefined : statusFilter);
      toast({
        title: "Export JSON",
        description: "Le fichier JSON a été téléchargé.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getStatusCounts = () => {
    if (!stats) return { total: 0, valid: 0, expiring: 0, expired: 0 };
    return {
      total: stats.total,
      valid: stats.valid,
      expiring: stats.expiring_soon,
      expired: stats.expired,
    };
  };

  const statusCounts = getStatusCounts();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch}>Réessayer</Button>
        </div>
      </div>
    );
  }

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRescan}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Rescan
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCsv}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={handleExportJson}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                JSON
              </Button>
            </div>
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
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">Chargement...</h3>
              <p className="text-muted-foreground">
                Chargement des certificats en cours.
              </p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {statusCounts.total === 0 ? "Aucun certificat" : "Aucun certificat trouvé"}
              </h3>
              <p className="text-muted-foreground">
                {statusCounts.total === 0 
                  ? "Aucun certificat n'a été détecté dans le répertoire de surveillance."
                  : "Aucun certificat ne correspond à vos critères de recherche."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((certificate) => (
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} sur {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.pages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

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