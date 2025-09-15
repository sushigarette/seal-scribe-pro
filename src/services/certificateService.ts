// Service pour récupérer les certificats depuis l'API JSON avec authentification par certificat client

export interface CertificateData {
  dn: string;
  serno: string;
  not_aft: string;
  // Autres champs possibles selon la structure JSON
  [key: string]: any;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  expirationDate: string;
  status: "valid" | "expiring" | "expired";
  type: string;
  fileSize: string;
  serialNumber: string;
  distinguishedName: string;
}

// Fonction pour parser le DN (Distinguished Name) et extraire les informations
const parseDistinguishedName = (dn: string) => {
  const parts = dn.split('/');
  const info: { [key: string]: string } = {};
  
  parts.forEach(part => {
    if (part.includes('=')) {
      const [key, value] = part.split('=', 2);
      info[key] = value;
    }
  });
  
  return info;
};

// Fonction pour déterminer le statut du certificat basé sur la date d'expiration
const getCertificateStatus = (notAfter: string): "valid" | "expiring" | "expired" => {
  const now = new Date();
  const expirationDate = new Date(notAfter);
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiration < 0) {
    return "expired";
  } else if (daysUntilExpiration <= 30) {
    return "expiring";
  } else {
    return "valid";
  }
};

// Fonction pour formater la date d'expiration
const formatExpirationDate = (notAfter: string): string => {
  const date = new Date(notAfter);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Fonction pour déterminer le type de certificat basé sur le DN
const getCertificateType = (dn: string): string => {
  const dnInfo = parseDistinguishedName(dn);
  const cn = dnInfo.CN?.toLowerCase() || '';
  
  if (cn.includes('ssl') || cn.includes('tls') || cn.includes('web')) {
    return 'SSL/TLS';
  } else if (cn.includes('code') || cn.includes('signing')) {
    return 'Code Signing';
  } else if (cn.includes('email') || cn.includes('smtp')) {
    return 'Email';
  } else if (cn.includes('client') || cn.includes('vpn')) {
    return 'Client';
  } else if (cn.includes('server') || cn.includes('api')) {
    return 'Server';
  } else {
    return 'Autre';
  }
};

// Fonction pour générer un nom lisible à partir du DN
const generateCertificateName = (dn: string): string => {
  const dnInfo = parseDistinguishedName(dn);
  const cn = dnInfo.CN || 'Certificat inconnu';
  const o = dnInfo.O || '';
  
  if (o) {
    return `${cn} (${o})`;
  }
  return cn;
};

// Fonction pour convertir les données JSON en format Certificate
export const transformCertificateData = (data: CertificateData[]): Certificate[] => {
  return data.map((cert, index) => {
    const dnInfo = parseDistinguishedName(cert.dn);
    const status = getCertificateStatus(cert.not_aft);
    
    return {
      id: cert.serno || `cert-${index}`,
      name: generateCertificateName(cert.dn),
      issuer: dnInfo.O || 'Émetteur inconnu',
      expirationDate: formatExpirationDate(cert.not_aft),
      status,
      type: getCertificateType(cert.dn),
      fileSize: 'N/A', // Pas disponible dans les données JSON
      serialNumber: cert.serno,
      distinguishedName: cert.dn
    };
  });
};

// Fonction pour récupérer les certificats depuis l'API
export const fetchCertificates = async (): Promise<Certificate[]> => {
  try {
    // Note: En production, cette requête devrait passer par un proxy backend
    // car les navigateurs ne peuvent pas utiliser directement des certificats clients
    const response = await fetch('/api/certificates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();
    console.log('Données reçues:', jsonData);
    
    // Extraire le tableau 'certs' de l'objet JSON
    const data: CertificateData[] = jsonData.certs || jsonData;
    
    if (!Array.isArray(data)) {
      throw new Error('Les données reçues ne sont pas un tableau de certificats');
    }
    
    return transformCertificateData(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des certificats:', error);
    throw new Error('Impossible de récupérer les certificats. Vérifiez votre connexion et vos certificats.');
  }
};
