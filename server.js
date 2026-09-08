const path = require('path');
const fs = require('fs');

// Sambungkan module resolution ke backend/node_modules
module.paths.push(path.resolve(__dirname, 'backend/node_modules'));

require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });
const express = require('express');

// Import Express API App dari folder backend
const apiApp = require('./backend/src/app');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Mount Seluruh REST API di bawah /api
app.use(apiApp);

// 2. Serve Static Frontend Files (Dist Vite)
const distPath = path.join(__dirname, 'frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // 3. SPA Fallback untuk seluruh route frontend
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Folder frontend/dist belum ditemukan. Jalankan `npm run build` di folder frontend jika ingin menyajikan antarmuka.');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log('🚀 Server SiPesand Production Fullstack Berjalan!');
  console.log(`🌐 Port: ${PORT}`);
  console.log(`📡 URL Akses: http://localhost:${PORT}`);
  console.log(`🔌 REST API Base: http://localhost:${PORT}/api`);
  console.log(`📊 Live Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log('================================================================');
});

module.exports = app;
