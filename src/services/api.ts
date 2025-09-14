const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
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

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Récupérer la liste des certificats
  async getCertificates(params: {
    page?: number;
    size?: number;
    search?: string;
    status_filter?: string;
    issuer_filter?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<CertificateListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/certs?${queryString}` : '/certs';
    
    return this.request(endpoint);
  }

  // Récupérer les détails d'un certificat
  async getCertificateDetails(archiveName: string): Promise<CertificateDetailsResponse> {
    return this.request(`/certs/${encodeURIComponent(archiveName)}`);
  }

  // Télécharger un certificat
  async downloadCertificate(archiveName: string): Promise<void> {
    const url = `${this.baseUrl}/certs/${encodeURIComponent(archiveName)}/download`;
    
    const headers: HeadersInit = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Erreur de téléchargement: ${response.status} ${response.statusText}`);
    }

    // Créer un lien de téléchargement
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${archiveName}.tar.gz`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Récupérer les statistiques
  async getStats(): Promise<StatsResponse> {
    return this.request('/stats');
  }

  // Forcer un rescan
  async rescanCertificates(): Promise<{ message: string }> {
    return this.request('/rescan', { method: 'POST' });
  }

  // Exporter en CSV
  async exportCsv(statusFilter?: string): Promise<void> {
    const params = statusFilter ? `?status_filter=${statusFilter}` : '';
    const url = `${this.baseUrl}/export/csv${params}`;
    
    const headers: HeadersInit = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Erreur d'export: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'certificates.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Exporter en JSON
  async exportJson(statusFilter?: string): Promise<void> {
    const params = statusFilter ? `?status_filter=${statusFilter}` : '';
    const url = `${this.baseUrl}/export/json${params}`;
    
    const headers: HeadersInit = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Erreur d'export: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'certificates.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
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
