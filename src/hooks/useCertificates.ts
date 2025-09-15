import { useState, useEffect, useCallback } from 'react';
import { apiService, Certificate, CertificateListResponse, StatsResponse } from '../services/api';

export interface UseCertificatesParams {
  page?: number;
  size?: number;
  search?: string;
  statusFilter?: string;
  issuerFilter?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface UseCertificatesReturn {
  certificates: Certificate[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
  stats: StatsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setIssuerFilter: (issuer: string) => void;
  setSorting: (sortBy: string, sortOrder: string) => void;
  downloadCertificate: (archiveName: string) => Promise<void>;
  rescanCertificates: () => Promise<void>;
  exportCsv: (statusFilter?: string) => Promise<void>;
  exportJson: (statusFilter?: string) => Promise<void>;
}

export const useCertificates = (initialParams: UseCertificatesParams = {}): UseCertificatesReturn => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<UseCertificatesParams>(initialParams);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: CertificateListResponse = await apiService.getCertificates({
        page: params.page || 1,
        size: params.size || 20,
        search: params.search,
        status_filter: params.statusFilter,
        issuer_filter: params.issuerFilter,
        sort_by: params.sortBy || 'not_after',
        sort_order: params.sortOrder || 'asc',
      });
      
      setCertificates(response.certificates);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des certificats');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([fetchCertificates(), fetchStats()]);
  }, [fetchCertificates, fetchStats]);

  const setPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    setParams(prev => ({ ...prev, statusFilter: status, page: 1 }));
  }, []);

  const setIssuerFilter = useCallback((issuer: string) => {
    setParams(prev => ({ ...prev, issuerFilter: issuer, page: 1 }));
  }, []);

  const setSorting = useCallback((sortBy: string, sortOrder: string) => {
    setParams(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const downloadCertificate = useCallback(async (archiveName: string) => {
    try {
      await apiService.downloadCertificate(archiveName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    }
  }, []);

  const rescanCertificates = useCallback(async () => {
    try {
      await apiService.rescanCertificates();
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rescan');
    }
  }, [refetch]);

  const exportCsv = useCallback(async (statusFilter?: string) => {
    try {
      await apiService.exportCsv(statusFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export CSV');
    }
  }, []);

  const exportJson = useCallback(async (statusFilter?: string) => {
    try {
      await apiService.exportJson(statusFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export JSON');
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    certificates,
    pagination,
    stats,
    loading,
    error,
    refetch,
    setPage,
    setSearch,
    setStatusFilter,
    setIssuerFilter,
    setSorting,
    downloadCertificate,
    rescanCertificates,
    exportCsv,
    exportJson,
  };
};

