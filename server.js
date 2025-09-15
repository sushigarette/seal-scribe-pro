import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration des certificats client
let httpsOptions = {};

try {
  const certPath = path.join(__dirname, 'certs', 'client.crt');
  const keyPath = path.join(__dirname, 'certs', 'client.key');
  
  // Vérifier si les fichiers de certificats existent
  if (!fs.existsSync(certPath)) {
    throw new Error(`Certificat client non trouvé: ${certPath}`);
  }
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Clé privée non trouvée: ${keyPath}`);
  }
  
  httpsOptions = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
    // Optionnel: certificat CA si nécessaire
    // ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca.crt')),
    rejectUnauthorized: false // À ajuster selon votre configuration
  };
  
  console.log('✅ Certificats client chargés avec succès');
} catch (error) {
  console.error('❌ Erreur de configuration des certificats:', error.message);
  console.log('\n📋 Instructions:');
  console.log('1. Placez votre fichier .crt dans certs/client.crt');
  console.log('2. Placez votre fichier .key dans certs/client.key');
  console.log('3. Redémarrez le serveur');
  process.exit(1);
}

// Route pour récupérer les certificats
app.get('/api/certificates', async (req, res) => {
  try {
    const targetUrl = 'https://office.mhcomm.fr/crtinfo/certindex.json';
    
    const options = {
      ...httpsOptions,
      method: 'GET',
      headers: {
        'User-Agent': 'SealScribe-Pro/1.0'
      }
    };

    const request = https.request(targetUrl, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (parseError) {
          console.error('Erreur de parsing JSON:', parseError);
          res.status(500).json({ error: 'Erreur de parsing des données JSON' });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Erreur de requête HTTPS:', error);
      res.status(500).json({ 
        error: 'Erreur de connexion au serveur de certificats',
        details: error.message 
      });
    });

    request.end();
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
});

// Endpoint pour récupérer les certificats traités
app.get('/api/treated-certificates', (req, res) => {
  try {
    const treatedCertsPath = path.join(__dirname, 'treated-certificates.json');
    
    if (fs.existsSync(treatedCertsPath)) {
      const data = fs.readFileSync(treatedCertsPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des certificats traités:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des certificats traités',
      details: error.message 
    });
  }
});

// Endpoint pour sauvegarder les certificats traités
app.post('/api/treated-certificates', (req, res) => {
  try {
    const treatedCertsPath = path.join(__dirname, 'treated-certificates.json');
    
    fs.writeFileSync(treatedCertsPath, JSON.stringify(req.body, null, 2));
    console.log('Certificats traités sauvegardés:', req.body.length, 'éléments');
    
    res.json({ success: true, count: req.body.length });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des certificats traités:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la sauvegarde des certificats traités',
      details: error.message 
    });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Serveur proxy démarré sur le port ${PORT}`);
  console.log(`Point d'accès: http://localhost:${PORT}/api/certificates`);
});
