/**
 * Cloudflare Pages Serverless API Engine for SiPesand
 * 
 * Melayani seluruh endpoint backend /api/* langsung di edge Cloudflare Pages
 * secara otomatis 24/7 tanpa membutuhkan server VPS terpisah.
 * Terintegrasi langsung dengan Firebase Cloud Firestore (Project: sipesand-app).
 */

const PROJECT_ID = "sipesand-app";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// -----------------------------------------------------------------------------
// HELPER: Firestore REST Decoder & Encoder
// -----------------------------------------------------------------------------
function decodeVal(v) {
  if (!v) return null;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
  if (v.doubleValue !== undefined) return parseFloat(v.doubleValue);
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.nullValue !== undefined) return null;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.mapValue !== undefined) return decodeFields(v.mapValue.fields || {});
  if (v.arrayValue !== undefined) return (v.arrayValue.values || []).map(decodeVal);
  return null;
}

function decodeFields(fields = {}) {
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    res[k] = decodeVal(v);
  }
  return res;
}

function encodeVal(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return { integerValue: String(v) };
    return { doubleValue: v };
  }
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeVal) } };
  if (typeof v === 'object') {
    const fields = {};
    for (const [k, val] of Object.entries(v)) {
      fields[k] = encodeVal(val);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function encodeDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = encodeVal(v);
  }
  return { fields };
}

function getTenant(request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('tenant') || url.searchParams.get('subdomain');
  if (q && !['master', 'app', 'mitra', 'pay', 'www', 'api', 'root'].includes(q.toLowerCase().trim())) {
    return q.toLowerCase().trim();
  }
  const customHeader = request.headers.get('x-tenant-subdomain');
  if (customHeader && !['master', 'app', 'mitra', 'pay', 'www', 'api', 'root'].includes(customHeader.toLowerCase().trim())) {
    return customHeader.toLowerCase().trim();
  }
  const host = request.headers.get('host') || url.hostname;
  if (host.includes('.sipesand.web.id')) {
    const parts = host.replace('.sipesand.web.id', '').split('.');
    if (parts[0] && !['www', 'api', 'mitra', 'pay', 'app', 'master'].includes(parts[0])) {
      return parts[0].trim();
    }
  }
  return 'darulrahman';
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-Subdomain',
    }
  });
}

// -----------------------------------------------------------------------------
// CLOUDFLARE R2 OBJECT STORAGE ENGINE & 10 GB QUOTA SAFEGUARD
// -----------------------------------------------------------------------------
// Cloudflare R2 Free Tier:
// - 10 GB Storage per month (10,737,418,240 bytes)
// - 1,000,000 Class A operations (put, list, delete)
// - 10,000,000 Class B operations (get)
// - 0 USD Egress Fee (Free data transfer out)
const MAX_R2_QUOTA_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB = 10,737,418,240 bytes
const WARN_R2_QUOTA_BYTES = 9 * 1024 * 1024 * 1024;  // 9 GB warning threshold (90%)

function getR2Bucket(context) {
  return context.env?.SIPESAND_R2 || context.env?.BUCKET || context.env?.R2_STORAGE || context.env?.R2_BUCKET || null;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getR2QuotaStats(r2) {
  if (!r2) {
    return {
      connected: false,
      message: 'Cloudflare R2 belum dihubungkan. Tambahkan binding SIPESAND_R2 di Pengaturan Pages Functions.',
      usedBytes: 0,
      usedFormatted: '0 B',
      quotaLimitBytes: MAX_R2_QUOTA_BYTES,
      quotaLimitFormatted: '10.00 GB',
      remainingBytes: MAX_R2_QUOTA_BYTES,
      remainingFormatted: '10.00 GB',
      percentUsed: 0,
      fileCount: 0,
      isWarning: false,
      isExceeded: false,
      timestamp: new Date().toISOString()
    };
  }

  let totalBytes = 0;
  let fileCount = 0;
  let cursor = undefined;
  let truncated = true;
  let loops = 0;

  try {
    while (truncated && loops < 10) {
      loops++;
      const res = await r2.list({ cursor, limit: 1000 });
      for (const obj of res.objects) {
        totalBytes += obj.size;
        fileCount++;
      }
      truncated = res.truncated;
      cursor = res.cursor;
    }
  } catch (e) {
    console.error('Error listing R2 objects:', e);
  }

  const remainingBytes = Math.max(0, MAX_R2_QUOTA_BYTES - totalBytes);
  const percentUsed = Number(((totalBytes / MAX_R2_QUOTA_BYTES) * 100).toFixed(2));
  const isWarning = totalBytes >= WARN_R2_QUOTA_BYTES;
  const isExceeded = totalBytes >= MAX_R2_QUOTA_BYTES;

  return {
    connected: true,
    message: isExceeded
      ? 'PERINGATAN: Kuota 10 GB Cloudflare R2 telah tercapai! Penyimpanan berkas baru dihentikan untuk mencegah timbulnya biaya.'
      : (isWarning ? 'PERINGATAN: Kapasitas R2 telah mencapai > 90% (9 GB).' : 'Kapasitas R2 aman dalam kuota gratis 10 GB Cloudflare.'),
    usedBytes: totalBytes,
    usedFormatted: formatBytes(totalBytes),
    quotaLimitBytes: MAX_R2_QUOTA_BYTES,
    quotaLimitFormatted: '10.00 GB',
    remainingBytes,
    remainingFormatted: formatBytes(remainingBytes),
    percentUsed,
    fileCount,
    isWarning,
    isExceeded,
    timestamp: new Date().toISOString()
  };
}

// -----------------------------------------------------------------------------
// CLOUDFLARE PAGES FUNCTIONS MAIN ROUTER
// -----------------------------------------------------------------------------
export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-Subdomain',
      }
    });
  }

  const tenant = getTenant(request);
  const route = (params.route || []).join('/');
  const r2 = getR2Bucket(context);

  try {
    // 1. Root /api
    if (!route || route === '') {
      return jsonResponse({
        success: true,
        message: 'SiPesand Serverless API (Cloudflare Pages Functions)',
        status: 'ONLINE',
        tenant,
        timestamp: new Date().toISOString()
      });
    }

    // 2. /api/dashboard/stats
    if (route === 'dashboard/stats') {
      const [santriRes, ledgerRes, billsRes, permitsRes] = await Promise.all([
        fetch(`${FIRESTORE_BASE}/tenants/${tenant}/santri`).then(r => r.json()),
        fetch(`${FIRESTORE_BASE}/tenants/${tenant}/ledger`).then(r => r.json()),
        fetch(`${FIRESTORE_BASE}/tenants/${tenant}/bills`).then(r => r.json()),
        fetch(`${FIRESTORE_BASE}/tenants/${tenant}/permits`).then(r => r.json()),
      ]);

      const santriList = (santriRes.documents || []).map(d => ({
        id: d.name.split('/').pop(),
        ...decodeFields(d.fields)
      }));

      const ledger = (ledgerRes.documents || []).map(d => decodeFields(d.fields));
      const bills = (billsRes.documents || []).map(d => decodeFields(d.fields));
      const permits = (permitsRes.documents || []).map(d => decodeFields(d.fields));

      const totalSantri = santriList.length;
      const activeSantri = santriList.filter(s => s.status === 'AKTIF').length;
      const rfidSantriCount = santriList.filter(s => s.nfcUid).length;
      const totalPocketBalance = santriList.reduce((acc, s) => acc + (parseFloat(s.saldo_saku) || 0), 0);

      let totalIncome = 0;
      let totalExpense = 0;
      ledger.forEach(e => {
        const amt = parseFloat(e.amount || 0);
        if (e.type === 'INCOME') totalIncome += amt;
        else totalExpense += amt;
      });

      const unpaidBills = bills.filter(b => b.status === 'UNPAID' || b.status === 'PENDING_VERIFICATION');
      const totalTunggakan = unpaidBills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
      const activePermitsCount = permits.filter(p => p.status === 'ACTIVE').length;

      return jsonResponse({
        success: true,
        data: {
          totalSantri,
          activeSantri,
          rfidSantriCount,
          totalPocketBalance,
          totalIncome,
          totalExpense,
          ledgerBalance: totalIncome - totalExpense,
          totalTunggakan,
          countTunggakan: unpaidBills.length,
          activePermitsCount,
          recentPocketTxs: [],
          recentLedgerTxs: ledger.slice(0, 5)
        }
      });
    }

    // 3. /api/settings
    if (route === 'settings') {
      if (method === 'GET') {
        const res = await fetch(`${FIRESTORE_BASE}/tenants/${tenant}/settings/config`);
        if (res.ok) {
          const doc = await res.json();
          return jsonResponse({ success: true, data: decodeFields(doc.fields) });
        }
        return jsonResponse({ success: true, data: {} });
      }
      if (method === 'POST') {
        const body = await request.json();
        const firestorePayload = encodeDoc({ ...body, updatedAt: new Date().toISOString() });
        const res = await fetch(`${FIRESTORE_BASE}/tenants/${tenant}/settings/config`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestorePayload)
        });
        return jsonResponse({ success: true, message: 'Pengaturan berhasil diperbarui di Cloud' });
      }
    }

    // 4. /api/santri
    if (route === 'santri') {
      if (method === 'GET') {
        const res = await fetch(`${FIRESTORE_BASE}/tenants/${tenant}/santri`);
        const json = await res.json();
        const items = (json.documents || []).map(d => ({
          id: d.name.split('/').pop(),
          ...decodeFields(d.fields)
        }));
        return jsonResponse({ success: true, data: items });
      }
      if (method === 'POST') {
        const body = await request.json();
        const docId = body.id || String(Date.now());
        const firestorePayload = encodeDoc({ ...body, id: docId, createdAt: new Date().toISOString() });
        await fetch(`${FIRESTORE_BASE}/tenants/${tenant}/santri/${docId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestorePayload)
        });
        return jsonResponse({ success: true, message: 'Santri berhasil disimpan', data: { id: docId, ...body } });
      }
    }

    // 5. /api/portal-wali/santri/:q
    if (route.startsWith('portal-wali/santri/')) {
      const q = decodeURIComponent(route.replace('portal-wali/santri/', '')).trim().toUpperCase();
      const res = await fetch(`${FIRESTORE_BASE}/tenants/${tenant}/santri`);
      const json = await res.json();
      const items = (json.documents || []).map(d => ({
        id: d.name.split('/').pop(),
        ...decodeFields(d.fields)
      }));

      const santri = items.find(s => 
        (s.nis && s.nis.toUpperCase() === q) ||
        (s.nfcUid && s.nfcUid.toUpperCase() === q) ||
        (s.nama && s.nama.toUpperCase().includes(q))
      );

      if (!santri) {
        return jsonResponse({ success: false, message: 'Data santri tidak ditemukan' }, 404);
      }

      // Ambil tagihan santri
      const billsRes = await fetch(`${FIRESTORE_BASE}/tenants/${tenant}/bills`);
      const billsJson = await billsRes.json();
      const bills = (billsJson.documents || [])
        .map(d => ({ id: d.name.split('/').pop(), ...decodeFields(d.fields) }))
        .filter(b => String(b.santriId) === String(santri.id));

      return jsonResponse({
        success: true,
        data: {
          santri,
          bills,
          pocketTxs: [],
          permits: []
        }
      });
    }

    // 6. /api/ledger
    if (route === 'ledger') {
      if (method === 'GET') {
        const res = await fetch(`${FIRESTORE_BASE}/tenants/${tenant}/ledger`);
        const json = await res.json();
        const items = (json.documents || []).map(d => ({
          id: d.name.split('/').pop(),
          ...decodeFields(d.fields)
        }));
        return jsonResponse({ success: true, data: items });
      }
      if (method === 'POST') {
        const body = await request.json();
        const docId = body.id || String(Date.now());
        const firestorePayload = encodeDoc({ ...body, id: docId, createdAt: new Date().toISOString() });
        await fetch(`${FIRESTORE_BASE}/tenants/${tenant}/ledger/${docId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestorePayload)
        });
        return jsonResponse({ success: true, message: 'Transaksi kas berhasil dicatat', data: { id: docId, ...body } });
      }
    }

    // 7. /api/storage/quota - Cek kuota R2 real-time & proteksi 10 GB
    if (route === 'storage/quota') {
      const stats = await getR2QuotaStats(r2);
      return jsonResponse({
        success: true,
        tenant,
        data: stats
      });
    }

    // 8. /api/upload - Upload file ke Cloudflare R2 dengan proteksi kuota 10 GB
    if (route === 'upload' && method === 'POST') {
      if (!r2) {
        return jsonResponse({
          success: false,
          message: 'Cloudflare R2 belum diaktifkan. Silakan tambahkan R2 binding SIPESAND_R2 di pengaturan Cloudflare Pages Functions.'
        }, 503);
      }

      const contentType = request.headers.get('content-type') || '';
      let fileName = '';
      let mimeType = 'application/octet-stream';
      let folder = 'uploads';
      let fileBuffer = null;

      if (contentType.includes('application/json')) {
        const json = await request.json();
        fileName = json.fileName || `file_${Date.now()}`;
        mimeType = json.mimeType || 'image/jpeg';
        folder = json.folder || 'uploads';
        
        const b64 = json.fileBase64 || json.base64 || '';
        const base64Clean = b64.replace(/^data:[^;]+;base64,/, '');
        const binaryStr = atob(base64Clean);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        fileBuffer = bytes.buffer;
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
          return jsonResponse({ success: false, message: 'Berkas file tidak ditemukan dalam form data' }, 400);
        }
        fileName = formData.get('fileName') || file.name || `file_${Date.now()}`;
        mimeType = file.type || 'application/octet-stream';
        folder = formData.get('folder') || 'uploads';
        fileBuffer = await file.arrayBuffer();
      } else {
        fileBuffer = await request.arrayBuffer();
        fileName = `file_${Date.now()}`;
      }

      const uploadSize = fileBuffer ? fileBuffer.byteLength : 0;
      if (uploadSize <= 0) {
        return jsonResponse({ success: false, message: 'Ukuran berkas kosong (0 bytes)' }, 400);
      }

      // STRICT QUOTA GUARD: Tolak jika melebihi batas 10 GB
      const stats = await getR2QuotaStats(r2);
      if (stats.usedBytes + uploadSize > MAX_R2_QUOTA_BYTES) {
        return jsonResponse({
          success: false,
          message: `Upload ditolak! Kapasitas Cloudflare R2 akan melampaui kuota 10 GB/bulan (${stats.usedFormatted} dari 10.00 GB). Sistem memblokir upload untuk mencegah tagihan biaya.`,
          currentUsage: stats.usedFormatted,
          limit: stats.quotaLimitFormatted
        }, 413);
      }

      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectKey = `tenants/${tenant}/${folder}/${Date.now()}_${sanitizedName}`;

      await r2.put(objectKey, fileBuffer, {
        httpMetadata: {
          contentType: mimeType,
        },
        customMetadata: {
          tenant,
          folder,
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        }
      });

      const fileUrl = `${url.origin}/api/storage/${objectKey}`;

      return jsonResponse({
        success: true,
        message: 'Berkas berhasil disimpan ke Cloudflare R2 Object Storage',
        data: {
          key: objectKey,
          url: fileUrl,
          size: uploadSize,
          sizeFormatted: formatBytes(uploadSize),
          mimeType,
          tenant
        }
      });
    }

    // 9. /api/storage/backup - Simpan database snapshot ke Cloudflare R2
    if (route === 'storage/backup' && method === 'POST') {
      if (!r2) {
        return jsonResponse({
          success: false,
          message: 'Cloudflare R2 belum dihubungkan. Tambahkan binding SIPESAND_R2 di Cloudflare Pages.'
        }, 503);
      }

      const body = await request.json();
      const backupJson = JSON.stringify(body, null, 2);
      const encoder = new TextEncoder();
      const backupBuffer = encoder.encode(backupJson);
      const backupSize = backupBuffer.byteLength;

      // Quota Guard
      const stats = await getR2QuotaStats(r2);
      if (stats.usedBytes + backupSize > MAX_R2_QUOTA_BYTES) {
        return jsonResponse({
          success: false,
          message: 'Kapasitas Cloudflare R2 10 GB penuh. Hapus cadangan lama terlebih dahulu.'
        }, 413);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const objectKey = `tenants/${tenant}/backups/backup_${tenant}_${timestamp}.json`;

      await r2.put(objectKey, backupBuffer, {
        httpMetadata: {
          contentType: 'application/json',
        },
        customMetadata: {
          tenant,
          type: 'DATABASE_BACKUP_JSON',
          uploadedAt: new Date().toISOString()
        }
      });

      return jsonResponse({
        success: true,
        message: 'Cadangan database berhasil diarsipkan ke Cloudflare R2',
        data: {
          key: objectKey,
          url: `${url.origin}/api/storage/${objectKey}`,
          size: backupSize,
          sizeFormatted: formatBytes(backupSize)
        }
      });
    }

    // 10. /api/storage/cleanup - Auto-pruning file sementara & backup usang (>30 hari)
    if (route === 'storage/cleanup' && method === 'POST') {
      if (!r2) {
        return jsonResponse({ success: false, message: 'Cloudflare R2 belum diaktifkan' }, 503);
      }

      const prefix = `tenants/${tenant}/`;
      const listed = await r2.list({ prefix });
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const keysToDelete = [];
      let freedBytes = 0;

      for (const obj of listed.objects) {
        const isTemp = obj.key.includes('/temp/') || obj.key.includes('/cache/');
        const isOldBackup = obj.key.includes('/backups/') && new Date(obj.uploaded).getTime() < thirtyDaysAgo;
        if (isTemp || isOldBackup) {
          keysToDelete.push(obj.key);
          freedBytes += obj.size;
        }
      }

      if (keysToDelete.length > 0) {
        await r2.delete(keysToDelete);
      }

      return jsonResponse({
        success: true,
        message: keysToDelete.length > 0
          ? `Berhasil membersihkan ${keysToDelete.length} berkas usang dan membebaskan ${formatBytes(freedBytes)} ruang penyimpanan.`
          : 'Tidak ada berkas sementara atau cadangan usang (>30 hari) yang perlu dibersihkan.',
        freedBytes,
        freedFormatted: formatBytes(freedBytes),
        deletedCount: keysToDelete.length
      });
    }

    // 11. /api/storage/* - Stream berkas langsung dari Cloudflare R2 dengan High-Performance Cache
    if (route.startsWith('storage/')) {
      const objectKey = route.replace(/^storage\//, '');
      if (!r2) {
        return new Response('Cloudflare R2 belum dihubungkan', { status: 503 });
      }

      if (method === 'DELETE') {
        await r2.delete(objectKey);
        return jsonResponse({ success: true, message: 'Berkas berhasil dihapus dari Cloudflare R2', key: objectKey });
      }

      const object = await r2.get(objectKey);
      if (!object) {
        return new Response('Berkas tidak ditemukan di Cloudflare R2', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(object.body, { headers });
    }

    // Fallback 404
    return jsonResponse({
      success: false,
      message: `Endpoint /api/${route} siap dilayani oleh Cloudflare Pages Functions`,
      tenant
    }, 200);

  } catch (err) {
    return jsonResponse({
      success: false,
      message: 'Serverless internal error: ' + err.message
    }, 500);
  }
}
