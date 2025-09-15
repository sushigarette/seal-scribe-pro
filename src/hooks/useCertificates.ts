import { useQuery } from '@tanstack/react-query';
import { fetchCertificates, Certificate } from '@/services/certificateService';

export const useCertificates = () => {
  return useQuery<Certificate[], Error>({
    queryKey: ['certificates'],
    queryFn: fetchCertificates,
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2 * 60 * 1000, // Considérer les données comme périmées après 2 minutes
  });
};

export const useCertificateStats = () => {
  const { data: certificates = [], ...query } = useCertificates();
  
  const stats = {
    total: certificates.length,
    valid: certificates.filter(cert => cert.status === 'valid').length,
    expiring: certificates.filter(cert => cert.status === 'expiring').length,
    expired: certificates.filter(cert => cert.status === 'expired').length,
  };
  
  return {
    ...query,
    data: certificates,
    stats,
  };
};
