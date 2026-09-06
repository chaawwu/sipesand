const https = require('https');

async function dumpAll() {
  const apiKey = process.env.FIREBASE_API_KEY || '';
  const authRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true })
  });
  const authData = await authRes.json();
  const token = authData.idToken;

  const collections = ['settings', 'users', 'santri', 'billTypes', 'bills', 'txSantri', 'txManual', 'txDevisi', 'pengajuan', 'pocketTx', 'permits', 'takziran'];
  const fullData = {};

  for (const col of collections) {
    const url = 'https://firestore.googleapis.com/v1/projects/webppdrv3/databases/(default)/documents/artifacts/webppdrv3/public/data/' + col;
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    const json = await res.json();
    console.log(`=== COLLECTION ${col} (${json.documents ? json.documents.length : 0} docs) ===`);
    fullData[col] = [];
    if (json.documents) {
      for (const d of json.documents) {
        const id = d.name.split('/').pop();
        const obj = { _docId: id };
        for (const [k, v] of Object.entries(d.fields || {})) {
          if ('stringValue' in v) obj[k] = v.stringValue;
          else if ('integerValue' in v) obj[k] = parseInt(v.integerValue);
          else if ('doubleValue' in v) obj[k] = parseFloat(v.doubleValue);
          else if ('booleanValue' in v) obj[k] = v.booleanValue;
          else if ('arrayValue' in v) {
            obj[k] = (v.arrayValue.values || []).map(val => {
              if ('stringValue' in val) return val.stringValue;
              if ('mapValue' in val) {
                const sub = {};
                for (const [sk, sv] of Object.entries(val.mapValue.fields || {})) {
                  sub[sk] = sv.stringValue || (sv.integerValue ? parseInt(sv.integerValue) : sv);
                }
                return sub;
              }
              return val;
            });
          } else {
            obj[k] = v;
          }
        }
        fullData[col].push(obj);
      }
    }
  }

  console.log('\n--- SUMMARY ---');
  for (const [k, v] of Object.entries(fullData)) {
    console.log(`${k}: ${v.length} items`);
    if (v.length > 0 && k !== 'settings') {
      console.log(`First item of ${k}:`, JSON.stringify(v[0], null, 2));
    }
    if (k === 'settings') {
      console.log('Settings:', JSON.stringify(v, null, 2));
    }
  }

  const fs = require('fs');
  fs.writeFileSync('scripts/firebase_dump.json', JSON.stringify(fullData, null, 2));
  console.log('\nSaved dump to scripts/firebase_dump.json');
}

dumpAll().catch(console.error);
