const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai Comprehensive Seeding SiPesand...');

  // 1. Bersihkan tabel lama
  await prisma.userAccount.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.divisionFund.deleteMany();
  await prisma.violationRecord.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.santriBill.deleteMany();
  await prisma.masterBill.deleteMany();
  await prisma.pocketTx.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.generalLedger.deleteMany();
  await prisma.santri.deleteMany();

  // 2. Data Santri
  const santriList = [
    {
      nis: '202601001',
      nfcUid: 'NFC-8A3F129B',
      nama: 'Muhammad Farhan Al-Fatih',
      gender: 'L',
      kelas: '10 IPA 1 (KMI 4)',
      kamar: 'Asrama Umar bin Khattab No. 04',
      alamat: 'Jl. Malioboro No. 45, Danurejan, Kota Yogyakarta',
      namaWali: 'H. Abdullah Farhan',
      noHpWali: '081234567890',
      saldo_saku: 175000,
      status: 'AKTIF',
    },
    {
      nis: '202601002',
      nfcUid: 'NFC-4B7C91D3',
      nama: 'Aisyah Nur Ramadhani',
      gender: 'P',
      kelas: '11 Keagamaan (KMI 5)',
      kamar: 'Asrama Siti Khadijah No. 12',
      alamat: 'Perumahan Griya Indah Blok C2, Sleman, D.I. Yogyakarta',
      namaWali: 'Dr. Hendra Gunawan',
      noHpWali: '081298765432',
      saldo_saku: 250000,
      status: 'AKTIF',
    },
    {
      nis: '202601003',
      nfcUid: 'NFC-9E2A5501',
      nama: 'Ahmad Zaki Mubarak',
      gender: 'L',
      kelas: '12 IPS (KMI 6)',
      kamar: 'Asrama Abu Bakar No. 07',
      alamat: 'Jl. Slamet Riyadi No. 102, Surakarta, Jawa Tengah',
      namaWali: 'Drs. Supriyadi',
      noHpWali: '081377889900',
      saldo_saku: -25000, // Status minus / darurat
      status: 'AKTIF',
    },
    {
      nis: '202601004',
      nfcUid: 'NFC-1C3D88AA',
      nama: 'Fathimah Azzahra',
      gender: 'P',
      kelas: '10 IPA 2 (KMI 4)',
      kamar: 'Asrama Aisyah No. 03',
      alamat: 'Kompleks Pesona Candi No. 18, Magelang, Jawa Tengah',
      namaWali: 'Rahmat Hidayat, M.Pd.',
      noHpWali: '081566778899',
      saldo_saku: 320000,
      status: 'AKTIF',
    },
    {
      nis: '202601005',
      nfcUid: 'NFC-7F88BB42',
      nama: 'Bilal Habasyi Rizqullah',
      gender: 'L',
      kelas: '11 IPA (KMI 5)',
      kamar: 'Asrama Ali bin Abi Thalib No. 02',
      alamat: 'Jl. Veteran No. 88, Semarang, Jawa Tengah',
      namaWali: 'H. Lukman Hakim',
      noHpWali: '081911223344',
      saldo_saku: 85000,
      status: 'AKTIF',
    }
  ];

  const createdSantri = [];
  for (const s of santriList) {
    const item = await prisma.santri.create({ data: s });
    createdSantri.push(item);
  }
  console.log(`✅ Dimasukkan ${createdSantri.length} data Santri.`);

  // 3. Master Tagihan
  const masterBillsData = [
    { name: 'SPP Syahriyah Pesantren', amount: 1200000, type: 'BULANAN_HIJRIYAH', description: 'SPP Pendidikan & Asrama Bulanan' },
    { name: 'Biaya Konsumsi Dapur Santri', amount: 650000, type: 'BULANAN_HIJRIYAH', description: 'Makan 3x Sehari & Nutrisi' },
    { name: 'Paket Kitab & Modul KMI', amount: 350000, type: 'TAHUNAN', description: 'Kitab Kuning & Buku Panduan Tahunan' },
    { name: 'Infaq Pembangunan Sarana', amount: 500000, type: 'SEKALI_BAYAR', description: 'Pengembangan Lab Komputer & Perpustakaan' },
  ];

  const createdMasters = [];
  for (const mb of masterBillsData) {
    const item = await prisma.masterBill.create({ data: mb });
    createdMasters.push(item);
  }

  // 4. Tagihan Santri
  const farhan = createdSantri[0];
  const aisyah = createdSantri[1];
  const zaki = createdSantri[2];
  const bilal = createdSantri[4];

  await prisma.santriBill.createMany({
    data: [
      {
        billCode: 'BILL-1448-001',
        santriId: farhan.id,
        masterBillId: createdMasters[0].id,
        title: 'SPP Syahriyah - Bulan Muharram 1448 H',
        amount: 1200000,
        hijriMonth: 'Muharram',
        hijriYear: '1448 H',
        status: 'PAID',
        paymentDate: new Date('2026-08-25T10:00:00Z'),
        paymentMethod: 'TRANSFER_BSI',
        verifiedBy: 'Ustadz Ridwan (Bendahara)',
        verifiedAt: new Date('2026-08-25T11:00:00Z'),
        receiptNumber: 'KWT-144801-001',
        notes: 'Lunas tepat waktu via BSI Virtual Account',
      },
      {
        billCode: 'BILL-1448-002',
        santriId: farhan.id,
        masterBillId: createdMasters[0].id,
        title: 'SPP Syahriyah - Bulan Safar 1448 H',
        amount: 1200000,
        hijriMonth: 'Safar',
        hijriYear: '1448 H',
        status: 'UNPAID',
        notes: 'Jatuh tempo tanggal 10 Safar 1448 H',
      },
      {
        billCode: 'BILL-1448-003',
        santriId: aisyah.id,
        masterBillId: createdMasters[0].id,
        title: 'SPP Syahriyah - Bulan Safar 1448 H',
        amount: 1200000,
        hijriMonth: 'Safar',
        hijriYear: '1448 H',
        status: 'PENDING_VERIFICATION',
        paymentDate: new Date('2026-08-31T14:30:00Z'),
        paymentMethod: 'QRIS',
        proofImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        notes: 'Bukti transfer diunggah oleh wali via Portal Online',
      },
      {
        billCode: 'BILL-1448-004',
        santriId: zaki.id,
        masterBillId: createdMasters[2].id,
        title: 'Paket Kitab & Modul KMI 1448 H',
        amount: 350000,
        hijriMonth: 'Muharram',
        hijriYear: '1448 H',
        status: 'UNPAID',
        notes: 'Tunggakan pengambilan kitab semester ganjil',
      }
    ],
  });

  // 5. Catatan Akademik & Muhafadzoh
  await prisma.academicRecord.createMany({
    data: [
      {
        santriId: farhan.id,
        type: 'MUHAFADZOH_QURAN',
        title: 'Setoran Hafalan Juz 30 & Surat Al-Kahfi',
        achievement: 'Lulus Ujian Juz 30 (Mumtaz) & 50 Ayat Al-Kahfi',
        score: 96,
        grade: 'Mumtaz',
        notes: 'Tajwid dan makharijul huruf sangat fasih dan tartil.',
        assessedBy: 'K.H. Syarif Hidayatullah, M.A.',
        date: new Date('2026-08-28T09:00:00Z'),
      },
      {
        santriId: farhan.id,
        type: 'EVALUASI_SIKAP',
        title: 'Penilaian Adab Sholat Berjamaah & Kedisiplinan',
        achievement: 'Sangat Rajin, Menjadi Muadzin Asrama',
        score: 95,
        grade: 'Mumtaz',
        notes: 'Selalu sholat di shaf pertama dan berakhlak mulia.',
        assessedBy: 'K.H. Syarif Hidayatullah, M.A.',
        date: new Date('2026-08-29T10:00:00Z'),
      },
      {
        santriId: aisyah.id,
        type: 'MUHAFADZOH_QURAN',
        title: 'Setoran Hafalan Juz 5 (Surat An-Nisa)',
        achievement: 'Juz 5 Halaman 1-10',
        score: 92,
        grade: 'Jayyid Jiddan',
        notes: 'Kelancaran hafalan baik, tingkatkan murojaah pada ayat mutasyabihat.',
        assessedBy: 'Ustadzah Maryam, Al-Hafidzah',
        date: new Date('2026-08-30T08:30:00Z'),
      }
    ],
  });

  // 6. Catatan Pelanggaran & Takziran
  await prisma.violationRecord.createMany({
    data: [
      {
        santriId: zaki.id,
        violation: 'Terlambat Masuk Kelas Pagi (15 Menit)',
        category: 'RINGAN',
        takziran: 'Membaca Mufrodat Bahasa Arab di depan kelas',
        status: 'SELESAI',
        officer: 'Ustadz Danang (Kamtib)',
        date: new Date('2026-08-29T07:15:00Z'),
        completedAt: new Date('2026-08-29T12:00:00Z'),
      },
      {
        santriId: bilal.id,
        violation: 'Lupa Merapikan Lemari Asrama saat Inspeksi Kamar',
        category: 'RINGAN',
        takziran: 'Piket Kebersihan Lorong Asrama Ali',
        status: 'PROSES',
        officer: 'Ustadz Danang (Kamtib)',
        date: new Date('2026-08-31T16:00:00Z'),
      }
    ]
  });

  // 7. Pengajuan Dana Divisi
  await prisma.divisionFund.createMany({
    data: [
      {
        code: 'DND-202608-01',
        division: 'DIVISI_KEAMANAN',
        title: 'Pengadaan Lampu Senter Patroli Malam & Buku Izin Cetak',
        amount: 450000,
        description: 'Pembelian 4 buah senter LED rechargeable & 10 buku form perizinan',
        status: 'APPROVED',
        requestedBy: 'Ustadz Danang (Koordinator Kamtib)',
        approvedBy: 'Ustadz Ridwan (Bendahara)',
        approvedAt: new Date('2026-08-30T10:00:00Z'),
        lpjProof: 'Kuitansi Pembelian Toko Elektronik Jaya',
      },
      {
        code: 'DND-202608-02',
        division: 'DIVISI_DAPUR',
        title: 'Belanja Gas LPG & Bumbu Dapur Pekanan',
        amount: 1800000,
        description: 'Pembelian 10 tabung gas 12kg dan stok bumbu dapur asrama santri',
        status: 'PENDING',
        requestedBy: 'Umi Kalsum (Kepala Dapur)',
      }
    ]
  });

  // 8. General Ledger
  await prisma.generalLedger.createMany({
    data: [
      {
        code: 'KAS-20260825-001',
        date: new Date('2026-08-25T08:00:00Z'),
        type: 'INCOME',
        category: 'SPP',
        amount: 15000000,
        description: 'Pembayaran SPP Syahriyah Muharram Santri',
        reference: 'INV-SPP-MUH-1448',
        division: 'DIVISI_KEUANGAN',
      },
      {
        code: 'KAS-20260826-002',
        date: new Date('2026-08-26T10:30:00Z'),
        type: 'INCOME',
        category: 'Donasi',
        amount: 7500000,
        description: 'Infaq & Donasi Pengembangan Lab Komputer & Server',
        reference: 'TF-BSI-99281',
        division: 'DIVISI_SARPRAS',
      },
      {
        code: 'KAS-20260828-003',
        date: new Date('2026-08-28T14:15:00Z'),
        type: 'EXPENSE',
        category: 'Operasional',
        amount: 3200000,
        description: 'Tagihan Listrik PLN & Internet Fiber Asrama',
        reference: 'PLN-BILL-881923',
        division: 'DIVISI_SARPRAS',
      },
    ]
  });

  // 9. Mutasi Uang Saku
  await prisma.pocketTx.createMany({
    data: [
      {
        txCode: 'TX-20260830-001',
        santriId: farhan.id,
        type: 'TOPUP',
        amount: 200000,
        balanceBefore: 0,
        balanceAfter: 200000,
        description: 'Setor Tabungan Uang Saku ke Pengurus',
        merchant: 'Pengurus Uang Saku Asrama',
        createdAt: new Date('2026-08-30T07:30:00Z'),
      },
      {
        txCode: 'TX-20260830-002',
        santriId: farhan.id,
        type: 'WITHDRAW',
        amount: 25000,
        balanceBefore: 200000,
        balanceAfter: 175000,
        description: 'Tarik Tunai Uang Saku Pekanan',
        merchant: 'Pengurus Uang Saku Asrama',
        createdAt: new Date('2026-08-30T11:45:00Z'),
      },
    ]
  });

  // 10. Perizinan
  await prisma.permit.createMany({
    data: [
      {
        permitCode: 'IZIN-20260901-001',
        santriId: zaki.id,
        type: 'LOMBA',
        reason: 'Delegasi Musabaqah Qiroatil Kutub (MQK) Tingkat Kabupaten',
        destination: 'Kemenag Sleman',
        departureTime: new Date('2026-09-01T07:00:00Z'),
        returnTime: new Date('2026-09-01T17:00:00Z'),
        status: 'ACTIVE',
        approvedBy: 'K.H. Syarif Hidayatullah, M.A.',
        notes: 'Didampingi Ustadz Pembimbing',
      },
      {
        permitCode: 'IZIN-20260831-001',
        santriId: farhan.id,
        type: 'BEROBAT',
        reason: 'Pemeriksaan Gigi ke RS PKU',
        destination: 'RS PKU Muhammadiyah',
        departureTime: new Date('2026-08-31T09:00:00Z'),
        returnTime: new Date('2026-08-31T13:00:00Z'),
        actualReturnTime: new Date('2026-08-31T12:30:00Z'),
        status: 'RETURNED',
        approvedBy: 'Ustadz Danang (Kamtib)',
      }
    ]
  });

  // 11. Pengaturan Sistem
  const settingsData = [
    { key: 'NAMA_LEMBAGA', value: 'Pondok Pesantren Terpadu SiPesand' },
    { key: 'TAGLINE_LEMBAGA', value: 'Lembaga Pendidikan Islam Modern & Tahfidzul Qur\'an' },
    { key: 'ALAMAT_LEMBAGA', value: 'Jl. Pesantren Digital No. 01, Kompleks Terpadu, Sleman, D.I. Yogyakarta 55581' },
    { key: 'NO_TELP', value: '(0274) 8899-7711' },
    { key: 'WHATSAPP_CENTER', value: '0812-3456-7890' },
    { key: 'EMAIL_LEMBAGA', value: 'sekretariat@sipesand.id' },
    { key: 'WEBSITE_LEMBAGA', value: 'https://www.sipesand.id' },
    { key: 'NAMA_KEPALA_PONDOK', value: 'K.H. Syarif Hidayatullah, M.A.' },
    { key: 'NAMA_BENDAHARA', value: 'Ustadz Ridwan, S.E.' },
    { key: 'BANK_NAME', value: 'Bank Syariah Indonesia (BSI)' },
    { key: 'BANK_ACCOUNT_NO', value: '7192837465' },
    { key: 'BANK_ACCOUNT_HOLDER', value: 'YAYASAN SIPESAND TERPADU' },
    { key: 'QRIS_PAYMENT_URL', value: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80' },
    { key: 'NFC_FEATURE_ENABLED', value: 'true' },
    { key: 'AUTO_BACKUP_ENABLED', value: 'true' },
  ];

  for (const st of settingsData) {
    await prisma.systemSetting.create({ data: st });
  }

  // 12. Manajemen Akun Multi-Divisi (Dengan Pemetaan Santri Asuh Contoh Ust. Ridwan & Evaluasi Kinerja)
  // Contoh Ust Ridwan memegang Farhan (id: 1), Aisyah (id: 2), Zaki (id: 3)
  const userAccounts = [
    { 
      username: 'admin', 
      password: 'admin123', 
      name: 'Super Administrator', 
      role: 'SUPER_ADMIN', 
      division: 'PUSAT',
      performanceNotes: 'Mengelola seluruh operasional sistem dengan baik.',
      performanceGrade: 'Mumtaz'
    },
    { 
      username: 'pengasuh', 
      password: 'admin123', 
      name: 'K.H. Syarif Hidayatullah, M.A. (Pengasuh)', 
      role: 'KEPALA_PONDOK', 
      division: 'PENGASUHAN',
      performanceNotes: 'Pengasuh Utama Pondok Pesantren.',
      performanceGrade: 'Mumtaz'
    },
    { 
      username: 'bendahara', 
      password: 'admin123', 
      name: 'Ustadz Ridwan, S.E. (Bendahara)', 
      role: 'BENDAHARA', 
      division: 'KEUANGAN',
      managedSantriIds: JSON.stringify([farhan.id, aisyah.id, zaki.id]),
      performanceNotes: 'Laporan pembukuan kas dan verifikasi tagihan sangat rapi dan tepat waktu.',
      performanceGrade: 'Mumtaz'
    },
    { 
      username: 'uangsaku', 
      password: 'admin123', 
      name: 'Ustadz Ridwan (Pengurus Uang Saku)', 
      role: 'PENGURUS_SAKU', 
      division: 'ASRAMA_POS',
      // Dipetakan memegang uang saku Farhan, Aisyah, dan Zaki
      managedSantriIds: JSON.stringify([farhan.id, aisyah.id, zaki.id]),
      performanceNotes: 'Amanah dalam pencatatan uang tunai santri asuh dan tertib pembukuan.',
      performanceGrade: 'Mumtaz'
    },
    { 
      username: 'kamtib', 
      password: 'admin123', 
      name: 'Ustadz Danang (Keamanan)', 
      role: 'KEAMANAN', 
      division: 'KAMTIB',
      performanceNotes: 'Disiplin dan aktif memantau perizinan santri.',
      performanceGrade: 'Jayyid Jiddan'
    },
  ];

  for (const ua of userAccounts) {
    await prisma.userAccount.create({ data: ua });
  }
  console.log(`✅ Dimasukkan ${userAccounts.length} Akun Multi-Divisi dengan Pemetaan Santri.`);

  console.log('🎉 Seeding Database SiPesand Selesai dengan Sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
