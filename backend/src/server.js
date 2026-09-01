require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server SiPesand Backend berjalan di port ${PORT}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
  console.log(`📊 Dashboard Stats: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`====================================================`);
});
