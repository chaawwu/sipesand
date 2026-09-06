const fs = require('fs');

async function fetchAllWithPagination() {
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
    fullData[col] = [];
    let pageToken = '';
    do {
      let url = `https://firestore.googleapis.com/v1/projects/webppdrv3/databases/(default)/documents/artifacts/webppdrv3/public/data/${col}?pageSize=100`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
      const json = await res.json();
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
      pageToken = json.nextPageToken || '';
    } while (pageToken);
    console.log(`Collection ${col}: Total ${fullData[col].length} documents fetched.`);
  }

  fs.writeFileSync('scripts/firebase_full_dump.json', JSON.stringify(fullData, null, 2));
  console.log('Complete dump written to scripts/firebase_full_dump.json');
}

fetchAllWithPagination().catch(console.error);
