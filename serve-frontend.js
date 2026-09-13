const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'frontend/dist');

const fs = require('fs');

// Serve static assets
app.use(express.static(distPath));

// Route khusus Unduh APK Android SiPesand
app.get(['/download/sipesand.apk', '/download/apk'], (req, res) => {
  const localApkPaths = [
    path.join(__dirname, 'dist-apk/sipesand-app.apk'),
    path.join(__dirname, 'frontend/public/download/sipesand.apk'),
    path.join(__dirname, 'frontend/android/app/build/outputs/apk/debug/app-debug.apk')
  ];

  for (const p of localApkPaths) {
    if (fs.existsSync(p)) {
      return res.download(p, 'sipesand-app.apk');
    }
  }

  // Fallback redirect ke cloud build GitHub Release
  res.redirect('https://github.com/chaawwu/sipesand/releases/latest/download/sipesand-app.apk');
});

// Fallback SPA routing (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SiPesand Frontend Production Server running on port ${PORT}`);
});
