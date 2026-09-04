/**
 * SIPESAND Automated Cloudflare KV Cloud Database Setup Script
 * Otomatisasi pembuatan KV Namespace & Binding ke Cloudflare Pages 'sipesand'
 */

const https = require('https');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '3b8a1ce0e7ef261c1debc81a27155860';
const PROJECT_NAME = process.env.CLOUDFLARE_PROJECT_NAME || 'sipesand';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
  console.log('================================================================');
  console.log('⚠️  CLOUDFLARE_API_TOKEN belum diatur.');
  console.log('Untuk menjalankan otomatisasi, jalankan dengan perintah:');
  console.log('  $env:CLOUDFLARE_API_TOKEN="token_anda"; node scripts/setup-cloudflare-kv.js');
  console.log('================================================================');
  process.exit(1);
}

function cfRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${ACCOUNT_ID}${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve({ success: false, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('🚀 [Cloudflare Auto-Setup] Memulai pembuatan Cloud Database...');
  
  // 1. Cek atau Buat KV Namespace
  console.log('📦 [1/3] Memeriksa / Membuat KV Namespace SIPESAND_KV...');
  const kvListRes = await cfRequest('/storage/kv/namespaces');
  let kvId = null;

  if (kvListRes?.success && Array.isArray(kvListRes.result)) {
    const existing = kvListRes.result.find(ns => ns.title === 'SIPESAND_KV');
    if (existing) {
      kvId = existing.id;
      console.log(`✅ KV Namespace SIPESAND_KV sudah ada dengan ID: ${kvId}`);
    }
  }

  if (!kvId) {
    console.log('⚡ Membuat KV Namespace SIPESAND_KV baru...');
    const createRes = await cfRequest('/storage/kv/namespaces', 'POST', { title: 'SIPESAND_KV' });
    if (createRes?.success && createRes.result) {
      kvId = createRes.result.id;
      console.log(`🎉 Berhasil membuat KV Namespace SIPESAND_KV (ID: ${kvId})!`);
    } else {
      console.error('❌ Gagal membuat KV Namespace:', createRes);
      process.exit(1);
    }
  }

  // 2. Binding ke Cloudflare Pages Project
  console.log(`🔗 [2/3] Memasang KV Binding ke project Pages "${PROJECT_NAME}"...`);
  const patchRes = await cfRequest(`/pages/projects/${PROJECT_NAME}`, 'PATCH', {
    deployment_configs: {
      production: {
        kv_namespaces: {
          SIPESAND_KV: { namespace_id: kvId }
        }
      },
      preview: {
        kv_namespaces: {
          SIPESAND_KV: { namespace_id: kvId }
        }
      }
    }
  });

  if (patchRes?.success) {
    console.log('🎉 [3/3] SUKSES! Cloud Database SIPESAND_KV telah terhubung ke Cloudflare Pages!');
    console.log('🌐 Sekarang data di Laptop, HP, dan Portal Wali Santri akan 100% tersimpan di cloud terpusat.');
  } else {
    console.log('ℹ️ Hasil binding:', patchRes);
    console.log(`👉 Jika binding memerlukan konfirmasi manual di dashboard, silakan gunakan ID KV: ${kvId}`);
  }
}

run().catch(console.error);
