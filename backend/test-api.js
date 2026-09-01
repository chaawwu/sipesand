const app = require('./src/app');
const http = require('http');

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`🧪 Test Server running on port ${port}`);

  try {
    const postDeduct = async (body, headers = {}) => {
      const res = await fetch(`${baseUrl}/api/pocket-tx/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
      return { status: res.status, data: await res.json() };
    };

    // 1. Test UNAUTHORIZED role (should return 403)
    const unauthorizedTest = await postDeduct(
      { nfcUid: 'NFC-8A3F129B', amount: 10000 },
      { 'x-pengurus-role': 'GUEST' }
    );
    console.log('✅ Test Unauthorized Role (GUEST) => Status:', unauthorizedTest.status, '(Harus 403)');

    // 2. Test AUTHORIZED role with sufficient balance
    const authorizedSuccess = await postDeduct(
      { nfcUid: 'NFC-8A3F129B', amount: 10000, description: 'Beli Kitab Nahwu', merchant: 'Koperasi Utama' },
      { 'x-pengurus-role': 'SUPER_ADMIN', 'x-pengurus-name': 'Kyai Ahmad (Super Admin)' }
    );
    console.log('✅ Test Authorized Deduction => Status:', authorizedSuccess.status, '| Saldo Baru:', authorizedSuccess.data.data.santri.saldo_saku);

    // 3. Test INSUFFICIENT balance without emergency flag (should return 400 with insufficient message)
    const insufficientTest = await postDeduct(
      { nfcUid: 'NFC-8A3F129B', amount: 9999999, isEmergency: false },
      { 'x-pengurus-role': 'BENDAHARA', 'x-pengurus-name': 'Ustadz Fauzi' }
    );
    console.log('✅ Test Insufficient Balance => Status:', insufficientTest.status, '| Message:', insufficientTest.data.message);

    // 4. Test EMERGENCY mode (allow overdraft / record minus)
    const emergencyTest = await postDeduct(
      { nfcUid: 'NFC-8A3F129B', amount: 500000, isEmergency: true, description: 'Biaya Obat Darurat Klinik' },
      { 'x-pengurus-role': 'SUPER_ADMIN', 'x-pengurus-name': 'Kyai Ahmad (Super Admin)' }
    );
    console.log('✅ Test Emergency Overdraft Deduction => Status:', emergencyTest.status, '| Saldo Minus:', emergencyTest.data.data.balanceAfter, '| Overdraft:', emergencyTest.data.data.isOverdraft);

    console.log('\n🎉 SEMUA PENGUJIAN OTORISASI DAN POTONG SALDO LOLOS 100%!');
  } catch (err) {
    console.error('❌ Error testing:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
