const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware CORS
app.use(cors());

// Proxy pour l'API externe
app.use('/api/external', createProxyMiddleware({
  target: 'https://office.mhcomm.fr',
  changeOrigin: true,
  pathRewrite: {
    '^/api/external': '/crtinfo'
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to:', proxyReq.path);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Proxy response status:', proxyRes.statusCode);
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying /api/external/* to https://office.mhcomm.fr/crtinfo/*`);
});

