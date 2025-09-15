// Service pour gérer les certificats traités
import { Certificate } from "@/components/CertificateListItem";

const TREATED_CERTS_KEY = 'treatedCertificates';
const TREATED_CERTS_API = '/api/treated-certificates';

// Interface pour les certificats traités
export interface TreatedCertificate {
  id: string;
  serialNumber: string;
  treatedAt: string;
  treatedBy?: string;
  notes?: string;
}

// Récupérer les certificats traités depuis le localStorage
export const getTreatedCertificates = (): TreatedCertificate[] => {
  try {
    const stored = localStorage.getItem(TREATED_CERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des certificats traités:', error);
    return [];
  }
};

// Sauvegarder les certificats traités dans le localStorage
export const saveTreatedCertificates = (treatedCerts: TreatedCertificate[]): void => {
  try {
    localStorage.setItem(TREATED_CERTS_KEY, JSON.stringify(treatedCerts));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des certificats traités:', error);
  }
};

// Marquer un certificat comme traité
export const markCertificateAsTreated = async (certificate: Certificate, notes?: string): Promise<void> => {
  const treatedCerts = getTreatedCertificates();
  const treatedCert: TreatedCertificate = {
    id: certificate.id,
    serialNumber: certificate.serialNumber,
    treatedAt: new Date().toISOString(),
    treatedBy: 'Utilisateur', // TODO: Récupérer depuis l'auth
    notes: notes || ''
  };

  // Vérifier si déjà traité
  const existingIndex = treatedCerts.findIndex(tc => tc.id === certificate.id);
  if (existingIndex >= 0) {
    treatedCerts[existingIndex] = treatedCert;
  } else {
    treatedCerts.push(treatedCert);
  }

  saveTreatedCertificates(treatedCerts);
  
  // Synchroniser avec l'API
  try {
    await syncTreatedCertificatesWithAPI();
  } catch (error) {
    console.error('Erreur lors de la synchronisation avec l\'API:', error);
  }
};

// Retirer un certificat des traités
export const unmarkCertificateAsTreated = (certificateId: string): void => {
  const treatedCerts = getTreatedCertificates();
  const filteredCerts = treatedCerts.filter(tc => tc.id !== certificateId);
  saveTreatedCertificates(filteredCerts);
};

// Vérifier si un certificat est traité
export const isCertificateTreated = (certificateId: string): boolean => {
  const treatedCerts = getTreatedCertificates();
  return treatedCerts.some(tc => tc.id === certificateId);
};

// Récupérer les certificats traités depuis l'API
export const fetchTreatedCertificatesFromAPI = async (): Promise<TreatedCertificate[]> => {
  try {
    const response = await fetch(TREATED_CERTS_API);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des certificats traités depuis l\'API:', error);
    return [];
  }
};

// Synchroniser les certificats traités avec l'API
export const syncTreatedCertificatesWithAPI = async (): Promise<void> => {
  try {
    const localTreatedCerts = getTreatedCertificates();
    const response = await fetch(TREATED_CERTS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(localTreatedCerts),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des certificats traités:', error);
  }
};

// Filtrer les certificats pour exclure les traités
export const filterOutTreatedCertificates = (certificates: Certificate[]): Certificate[] => {
  const treatedCerts = getTreatedCertificates();
  const treatedIds = new Set(treatedCerts.map(tc => tc.id));
  return certificates.filter(cert => !treatedIds.has(cert.id));
};
