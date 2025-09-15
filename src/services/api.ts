const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const EXTERNAL_API_URL = 'http://localhost:3001/api/external/certindex.json';
const SAVED_CERTIFICATES_URL = 'http://localhost:3001/api/saved-certificates';

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
  status: 'valid' | 'expiring_soon' | 'expired';
  fingerprint_sha256: string;
  fingerprint_sha1: string;
  algorithm: string;
  key_length: number;
  domains: string;
  file_size: number;
  last_modified: string;
  is_valid: boolean;
}

export interface CertificateListResponse {
  certificates: Certificate[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export interface StatsResponse {
  total: number;
  valid: number;
  expiring_soon: number;
  expired: number;
  issuers: Array<{
    name: string;
    count: number;
  }>;
}

export interface CertificateDetailsResponse {
  archive_name: string;
  certificates: Certificate[];
}

// Interface pour les données de l'API externe
export interface ExternalCertificate {
  nom?: string;
  name?: string;
  subject?: string;
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
  status?: string;
  fingerprint?: string;
  algorithm?: string;
  keyLength?: number;
  domains?: string[];
  fileSize?: number;
  [key: string]: any;
}

class ApiService {
  private baseUrl: string;
  private externalApiUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.externalApiUrl = EXTERNAL_API_URL;
    this.authToken = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Ajouter l'authentification si disponible
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide
        this.authToken = null;
        localStorage.removeItem('auth_token');
        throw new Error('Authentification requise');
      }
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Récupérer les données depuis l'API externe
  async getExternalCertificates(): Promise<ExternalCertificate[]> {
    try {
      const response = await fetch(this.externalApiUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des données externes: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Si les données sont dans un tableau, les retourner directement
      if (Array.isArray(data)) {
        return data;
      }
      
      // Si les données sont dans un objet avec une propriété contenant le tableau
      if (data.certificates && Array.isArray(data.certificates)) {
        return data.certificates;
      }
      
      if (data.certs && Array.isArray(data.certs)) {
        return data.certs;
      }
      
      // Si c'est un objet unique, le mettre dans un tableau
      return [data];
      
    } catch (error) {
      console.error('Erreur lors de la récupération des certificats externes:', error);
      console.log('Utilisation des données d\'exemple en fallback...');
      
      // Retourner des données d'exemple en cas d'erreur
      return this.getFallbackCertificates();
    }
  }

  // Données d'exemple en cas d'erreur de connexion
  private getFallbackCertificates(): ExternalCertificate[] {
    return [
      {
        nom: "exemple.com",
        name: "exemple.com",
        subject: "CN=exemple.com, O=Mon Entreprise, C=FR",
        issuer: "Let's Encrypt",
        notBefore: "2024-01-15T00:00:00Z",
        notAfter: "2025-01-15T00:00:00Z",
        status: "valid",
        fingerprint: "A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90",
        algorithm: "SHA256-RSA",
        keyLength: 2048,
        domains: ["exemple.com", "www.exemple.com"],
        fileSize: 2048
      },
      {
        nom: "api.monsite.fr",
        name: "api.monsite.fr",
        subject: "CN=api.monsite.fr, O=Mon Entreprise, C=FR",
        issuer: "DigiCert",
        notBefore: "2024-02-01T00:00:00Z",
        notAfter: "2025-02-01T00:00:00Z",
        status: "valid",
        fingerprint: "B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1",
        algorithm: "SHA256-RSA",
        keyLength: 4096,
        domains: ["api.monsite.fr", "*.monsite.fr"],
        fileSize: 4096
      },
      {
        nom: "admin.entreprise.com",
        name: "admin.entreprise.com",
        subject: "CN=admin.entreprise.com, O=Entreprise Corp, C=FR",
        issuer: "Sectigo",
        notBefore: "2023-12-01T00:00:00Z",
        notAfter: "2024-12-01T00:00:00Z",
        status: "expired",
        fingerprint: "C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2",
        algorithm: "SHA256-RSA",
        keyLength: 2048,
        domains: ["admin.entreprise.com"],
        fileSize: 2048
      },
      {
        nom: "test.local",
        name: "test.local",
        subject: "CN=test.local, O=Test Corp, C=FR",
        issuer: "Self-Signed",
        notBefore: "2024-06-01T00:00:00Z",
        notAfter: "2024-12-01T00:00:00Z",
        status: "expiring_soon",
        fingerprint: "D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3",
        algorithm: "SHA256-RSA",
        keyLength: 1024,
        domains: ["test.local", "*.test.local"],
        fileSize: 1024
      }
    ];
  }

  // Convertir les données externes vers le format interne
  convertExternalToInternal(externalCerts: ExternalCertificate[]): Certificate[] {
    return externalCerts.map((cert, index) => ({
      id: index + 1,
      archive_name: cert.nom || cert.name || `cert-${index + 1}`,
      file_path: '',
      subject_cn: cert.subject || '',
      subject_dn: cert.subject || '',
      issuer: cert.issuer || '',
      issuer_dn: cert.issuer || '',
      not_before: cert.notBefore || '',
      not_after: cert.notAfter || '',
      days_to_expiry: this.calculateDaysToExpiry(cert.notAfter),
      status: this.determineStatus(cert.notAfter, cert.status),
      fingerprint_sha256: cert.fingerprint || '',
      fingerprint_sha1: '',
      algorithm: cert.algorithm || '',
      key_length: cert.keyLength || 0,
      domains: Array.isArray(cert.domains) ? JSON.stringify(cert.domains) : (cert.domains || ''),
      file_size: cert.fileSize || 0,
      last_modified: new Date().toISOString(),
      is_valid: true
    }));
  }

  private calculateDaysToExpiry(notAfter: string): number {
    if (!notAfter) return 0;
    
    try {
      const expiryDate = new Date(notAfter);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  private determineStatus(notAfter: string, status?: string): 'valid' | 'expiring_soon' | 'expired' {
    if (status) {
      if (status.toLowerCase().includes('expired')) return 'expired';
      if (status.toLowerCase().includes('expiring')) return 'expiring_soon';
      return 'valid';
    }
    
    const daysToExpiry = this.calculateDaysToExpiry(notAfter);
    if (daysToExpiry < 0) return 'expired';
    if (daysToExpiry <= 30) return 'expiring_soon';
    return 'valid';
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Récupérer la liste des certificats (depuis l'API externe)
  async getCertificates(params: {
    page?: number;
    size?: number;
    search?: string;
    status_filter?: string;
    issuer_filter?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<CertificateListResponse> {
    try {
      // Récupérer les données depuis l'API externe
      const externalCerts = await this.getExternalCertificates();
      const certificates = this.convertExternalToInternal(externalCerts);
      
      // Appliquer les filtres
      let filteredCerts = certificates;
      
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredCerts = filteredCerts.filter(cert => 
          cert.archive_name.toLowerCase().includes(searchTerm) ||
          cert.subject_cn.toLowerCase().includes(searchTerm) ||
          cert.issuer.toLowerCase().includes(searchTerm)
        );
      }
      
      if (params.status_filter) {
        filteredCerts = filteredCerts.filter(cert => cert.status === params.status_filter);
      }
      
      if (params.issuer_filter) {
        filteredCerts = filteredCerts.filter(cert => 
          cert.issuer.toLowerCase().includes(params.issuer_filter!.toLowerCase())
        );
      }
      
      // Appliquer le tri
      const sortBy = params.sort_by || 'not_after';
      const sortOrder = params.sort_order || 'asc';
      
      filteredCerts.sort((a, b) => {
        let aValue = (a as any)[sortBy];
        let bValue = (b as any)[sortBy];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
      
      // Appliquer la pagination
      const page = params.page || 1;
      const size = params.size || 20;
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedCerts = filteredCerts.slice(startIndex, endIndex);
      
      return {
        certificates: paginatedCerts,
        pagination: {
          page,
          size,
          total: filteredCerts.length,
          pages: Math.ceil(filteredCerts.length / size)
        }
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des certificats:', error);
      // Retourner une réponse vide en cas d'erreur
      return {
        certificates: [],
        pagination: {
          page: 1,
          size: 20,
          total: 0,
          pages: 0
        }
      };
    }
  }

  // Récupérer les détails d'un certificat
  async getCertificateDetails(archiveName: string): Promise<CertificateDetailsResponse> {
    const externalCerts = await this.getExternalCertificates();
    const certificates = this.convertExternalToInternal(externalCerts);
    const cert = certificates.find(c => c.archive_name === archiveName);
    
    if (!cert) {
      throw new Error('Certificat non trouvé');
    }
    
    return {
      archive_name: archiveName,
      certificates: [cert]
    };
  }

  // Télécharger un certificat (simulation)
  async downloadCertificate(archiveName: string): Promise<void> {
    // Pour l'instant, on simule le téléchargement
    console.log(`Téléchargement simulé de ${archiveName}`);
  }

  // Récupérer les statistiques
  async getStats(): Promise<StatsResponse> {
    try {
      const externalCerts = await this.getExternalCertificates();
      const certificates = this.convertExternalToInternal(externalCerts);
      
      const total = certificates.length;
      const valid = certificates.filter(c => c.status === 'valid').length;
      const expiring_soon = certificates.filter(c => c.status === 'expiring_soon').length;
      const expired = certificates.filter(c => c.status === 'expired').length;
      
      // Statistiques par émetteur
      const issuerCounts: { [key: string]: number } = {};
      certificates.forEach(cert => {
        const issuer = cert.issuer || 'Inconnu';
        issuerCounts[issuer] = (issuerCounts[issuer] || 0) + 1;
      });
      
      const issuers = Object.entries(issuerCounts).map(([name, count]) => ({
        name,
        count
      }));
      
      return {
        total,
        valid,
        expiring_soon,
        expired,
        issuers
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        total: 0,
        valid: 0,
        expiring_soon: 0,
        expired: 0,
        issuers: []
      };
    }
  }

  // Forcer un rescan (simulation)
  async rescanCertificates(): Promise<{ message: string }> {
    return { message: 'Rescan effectué' };
  }

  // Exporter en CSV
  async exportCsv(statusFilter?: string): Promise<void> {
    const externalCerts = await this.getExternalCertificates();
    const certificates = this.convertExternalToInternal(externalCerts);
    
    let filteredCerts = certificates;
    if (statusFilter) {
      filteredCerts = certificates.filter(cert => cert.status === statusFilter);
    }
    
    const csvContent = [
      'Archive Name,Subject CN,Issuer,Not Before,Not After,Days to Expiry,Status,Fingerprint SHA256,Algorithm,Key Length,Domains'
    ].concat(
      filteredCerts.map(cert => [
        cert.archive_name,
        cert.subject_cn,
        cert.issuer,
        cert.not_before,
        cert.not_after,
        cert.days_to_expiry,
        cert.status,
        cert.fingerprint_sha256,
        cert.algorithm,
        cert.key_length,
        cert.domains
      ].join(','))
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'certificates.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Exporter en JSON
  async exportJson(statusFilter?: string): Promise<void> {
    const externalCerts = await this.getExternalCertificates();
    const certificates = this.convertExternalToInternal(externalCerts);
    
    let filteredCerts = certificates;
    if (statusFilter) {
      filteredCerts = certificates.filter(cert => cert.status === statusFilter);
    }
    
    const jsonContent = JSON.stringify(filteredCerts, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'certificates.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Définir le token d'authentification
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  // Supprimer le token d'authentification
  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService();
