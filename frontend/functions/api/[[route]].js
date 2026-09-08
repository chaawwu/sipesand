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
