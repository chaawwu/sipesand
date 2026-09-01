#!/usr/bin/env bash
# ==============================================================================
# SiPesand SaaS Automated 1-Click Deployment Script (sipesand.web.id)
# ==============================================================================

set -e

echo "===================================================================="
echo "🚀 Memulai Otomatisasi Deployment SiPesand Multi-Tenant SaaS"
echo "🌐 Domain Target: https://sipesand.web.id (*.sipesand.web.id)"
echo "===================================================================="

# 1. Install Backend Dependencies & Run Database Migrations
echo "📦 [1/4] Menginstal dependensi Backend & Sinkronisasi Database Prisma..."
cd backend
npm install --production=false
npx prisma generate
npx prisma db push
cd ..

# 2. Build Frontend React Assets
echo "🎨 [2/4] Melakukan build aset produksi Frontend..."
cd frontend
npm install --production=false
npm run build
cd ..

# 3. Create Logs Directory
mkdir -p logs

# 4. Start / Reload with PM2 Process Manager
echo "⚡ [3/4] Menjalankan layanan dengan PM2 Cluster..."
if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
    pm2 save
    echo "✅ PM2 cluster berhasil diaktifkan!"
else
    echo "⚠️ PM2 tidak terdeteksi. Menginstal PM2 secara global..."
    npm install -g pm2
    pm2 start ecosystem.config.js
    pm2 save
fi

echo "===================================================================="
echo "🎉 DEPLOYMENT SELESAI & SISTEM TELAH AKTIF!"
echo "👉 Platform SaaS: https://sipesand.web.id"
echo "👉 API Endpoint: https://sipesand.web.id/api"
echo "👉 Webhook Gateway: https://sipesand.web.id/api/webhook/pg"
echo "===================================================================="
