const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware CORS
app.use(cors());
app.use(express.json());

// Configuration pour les certificats client
const httpsOptions = {
  // Chemin vers vos certificats (à adapter selon votre configuration)
  key: process.env.CLIENT_KEY_PATH || '/path/to/your/client.key',
  cert: process.env.CLIENT_CERT_PATH || '/path/to/your/client.crt',
  ca: process.env.CLIENT_CA_PATH || '/path/to/your/ca.crt',
  // Désactiver la vérification SSL si nécessaire
  rejectUnauthorized: false
};

// Endpoint pour récupérer les certificats
app.get('/api/external/certindex.json', async (req, res) => {
  try {
    console.log('Tentative de récupération des certificats...');
    
    const options = {
      hostname: 'office.mhcomm.fr',
      port: 443,
      path: '/crtinfo/certindex.json',
      method: 'GET',
      headers: {
        'User-Agent': 'Certificate-Manager-Proxy/1.0',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
      },
      // Options HTTPS avec certificats client
      ...httpsOptions
    };

    const request = https.request(options, (response) => {
      console.log(`Status: ${response.statusCode}`);
      console.log(`Headers:`, response.headers);
      
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
          } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
            res.status(500).json({ error: 'Erreur de parsing JSON', details: parseError.message });
          }
        } else {
          console.error(`Erreur HTTP: ${response.statusCode}`);
          res.status(response.statusCode).json({ 
            error: 'Erreur de récupération des données', 
            status: response.statusCode,
            message: data 
          });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Erreur de requête:', error);
      res.status(500).json({ error: 'Erreur de connexion', details: error.message });
    });

    request.setTimeout(10000, () => {
      console.error('Timeout de la requête');
      request.destroy();
      res.status(504).json({ error: 'Timeout de la requête' });
    });

    request.end();
    
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ error: 'Erreur interne', details: error.message });
  }
});

// Endpoint de test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Proxy backend fonctionne',
    timestamp: new Date().toISOString(),
    httpsOptions: {
      hasKey: !!httpsOptions.key,
      hasCert: !!httpsOptions.cert,
      hasCA: !!httpsOptions.ca
    }
  });
});

// Endpoint pour uploader un fichier JSON manuellement
app.post('/api/upload-certificates', (req, res) => {
  try {
    const { certificates } = req.body;
    
    if (!certificates || !Array.isArray(certificates)) {
      return res.status(400).json({ error: 'Données de certificats invalides' });
    }
    
    // Sauvegarder les certificats dans un fichier temporaire
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'certificates.json');
    fs.writeFileSync(filePath, JSON.stringify(certificates, null, 2));
    
    res.json({ 
      message: 'Certificats sauvegardés avec succès',
      count: certificates.length,
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).json({ error: 'Erreur de sauvegarde', details: error.message });
  }
});

// Endpoint pour récupérer les certificats sauvegardés
app.get('/api/saved-certificates', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data', 'certificates.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Aucun fichier de certificats sauvegardé' });
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const certificates = JSON.parse(data);
    
    res.json(certificates);
    
  } catch (error) {
    console.error('Erreur lors de la lecture:', error);
    res.status(500).json({ error: 'Erreur de lecture', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy backend démarré sur http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   - GET  /api/external/certindex.json (avec certificats client)`);
  console.log(`   - GET  /api/test (test de connexion)`);
  console.log(`   - POST /api/upload-certificates (upload manuel)`);
  console.log(`   - GET  /api/saved-certificates (récupération sauvegardé)`);
  console.log(`\n🔐 Configuration certificats:`);
  console.log(`   - CLIENT_KEY_PATH: ${process.env.CLIENT_KEY_PATH || 'Non défini'}`);
  console.log(`   - CLIENT_CERT_PATH: ${process.env.CLIENT_CERT_PATH || 'Non défini'}`);
  console.log(`   - CLIENT_CA_PATH: ${process.env.CLIENT_CA_PATH || 'Non défini'}`);
});

