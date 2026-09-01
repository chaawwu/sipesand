const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'frontend/dist');

// Serve static assets
app.use(express.static(distPath));

// Fallback SPA routing (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SiPesand Frontend Production Server running on port ${PORT}`);
});
