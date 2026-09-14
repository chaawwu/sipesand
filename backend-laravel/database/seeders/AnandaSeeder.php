<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnandaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Pesantren Darul Rahman
        $pesantrenId = DB::table('pesantrens')->insertGetId([
            'code' => 'darulrahman',
            'name' => 'Pondok Pesantren Darul Rahman',
            'slug' => 'ponpes-darul-rahman',
            'phone' => '021-78901234',
            'address' => 'Jl. K.H. Moch. Syadzili No. 1, Cilandak, Jakarta Selatan',
            'logo_url' => 'https://ui-avatars.com/api/?name=Darul+Rahman&background=07266E&color=fff&size=200',
            'banner_url' => 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&q=80',
            'kaserapay_merchant_id' => 'KSR-PST-001',
            'kaserapay_api_key' => 'ksr_live_sipesand_darulrahman',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Pesantren 2 for multi-tenant check
        DB::table('pesantrens')->insert([
            'code' => 'alfalah',
            'name' => 'Pondok Pesantren Al-Falah Islamic Boarding School',
            'slug' => 'ponpes-al-falah',
            'phone' => '022-87654321',
            'address' => 'Jl. Pesantren No. 45, Bandung',
            'logo_url' => 'https://ui-avatars.com/api/?name=Al+Falah&background=0B6BCB&color=fff&size=200',
            'banner_url' => 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&q=80',
            'kaserapay_merchant_id' => 'KSR-PST-002',
            'kaserapay_api_key' => 'ksr_live_sipesand_alfalah',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Wali Santri
        $waliId = DB::table('wali_santris')->insertGetId([
            'pesantren_id' => $pesantrenId,
            'name' => 'H. Ahmad Fauzi, S.E.',
            'whatsapp' => '081234567890',
            'relationship' => 'Ayah',
            'address' => 'Jl. Kemang Raya No. 12, Jakarta Selatan',
            'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            'otp_code' => '123456',
            'otp_expires_at' => Carbon::now()->addDays(30),
            'is_verified' => true,
            'fcm_token' => 'fcm_sample_token_wali_001',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Santri
        $santriId = DB::table('santris')->insertGetId([
            'pesantren_id' => $pesantrenId,
            'wali_id' => $waliId,
            'nis' => '202409001',
            'name' => 'Muhammad Farhan Al-Faqih',
            'nama' => 'Muhammad Farhan Al-Faqih',
            'gender' => 'L',
            'kelas' => '3 Aliyah (Kelas Unggulan)',
            'kamar' => 'Gedung Al-Fatih Lantai 2 / No. 04',
            'musyrif_name' => 'Ust. Rahmat Hidayat, Lc.',
            'musyrif_phone' => '081399887766',
            'photo_url' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
            'status' => 'Aktif',
            'saldo_uang_saku' => 385000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Pembayaran / Tagihan
        $paidBillId = DB::table('pembayarans')->insertGetId([
            'pesantren_id' => $pesantrenId,
            'santri_id' => $santriId,
            'bill_no' => 'INV-202608-0012',
            'title' => 'SPP & Asrama Bulan Agustus 2026',
            'category' => 'SPP',
            'period' => '2026-08',
            'amount' => 450000.00,
            'admin_fee' => 0.00,
            'total_amount' => 450000.00,
            'due_date' => '2026-08-10',
            'status' => 'paid',
            'payment_method' => 'kaserapay',
            'channel' => 'qris_kasera',
            'paid_at' => Carbon::now()->subWeeks(3),
            'verified_by' => 'Sistem Otomatis (KaseraPay Webhook)',
            'notes' => 'Pembayaran lunas tepat waktu',
            'created_at' => Carbon::now()->subWeeks(4),
            'updated_at' => Carbon::now()->subWeeks(3),
        ]);

        // Kwitansi untuk tagihan lunas
        DB::table('kwitansis')->insert([
            'pesantren_id' => $pesantrenId,
            'pembayaran_id' => $paidBillId,
            'receipt_no' => 'KW-202608-0012',
            'payer_name' => 'H. Ahmad Fauzi, S.E.',
            'amount' => 450000.00,
            'terbilang' => 'Empat Ratus Lima Puluh Ribu Rupiah',
            'description' => 'Pembayaran SPP & Asrama Bulan Agustus 2026 santri Muhammad Farhan Al-Faqih (NIS: 202409001)',
            'pdf_url' => '/api/v1/wali/kwitansi/KW-202608-0012/pdf',
            'created_at' => Carbon::now()->subWeeks(3),
            'updated_at' => Carbon::now()->subWeeks(3),
        ]);

        // Tagihan Aktif Belum Lunas
        DB::table('pembayarans')->insert([
            'pesantren_id' => $pesantrenId,
            'santri_id' => $santriId,
            'bill_no' => 'INV-202609-0045',
            'title' => 'SPP & Operasional Bulan September 2026',
            'category' => 'SPP',
            'period' => '2026-09',
            'amount' => 450000.00,
            'admin_fee' => 2500.00,
            'total_amount' => 452500.00,
            'due_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
            'status' => 'unpaid',
            'payment_method' => null,
            'channel' => null,
            'notes' => 'Jatuh tempo tanggal 20 September 2026',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('pembayarans')->insert([
            'pesantren_id' => $pesantrenId,
            'santri_id' => $santriId,
            'bill_no' => 'INV-202609-0099',
            'title' => 'Pengadaan Kitab Kuning Semester Ganjil',
            'category' => 'Kegiatan',
            'period' => '2026-09',
            'amount' => 275000.00,
            'admin_fee' => 0.00,
            'total_amount' => 275000.00,
            'due_date' => Carbon::now()->addDays(12)->format('Y-m-d'),
            'status' => 'unpaid',
            'payment_method' => null,
            'channel' => null,
            'notes' => 'Kitab Fathul Qorib, Alfiyah Ibnu Malik, & Taqrib',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. Riwayat Uang Saku
        DB::table('uang_sakus')->insert([
            [
                'pesantren_id' => $pesantrenId,
                'santri_id' => $santriId,
                'type' => 'topup',
                'amount' => 250000.00,
                'balance_after' => 500000.00,
                'description' => 'Top Up Uang Saku via KaseraPay QRIS',
                'merchant_name' => 'KaseraPay Instant',
                'nfc_card_uid' => '04A1B2C3D4',
                'created_at' => Carbon::now()->subDays(6),
                'updated_at' => Carbon::now()->subDays(6),
            ],
            [
                'pesantren_id' => $pesantrenId,
                'santri_id' => $santriId,
                'type' => 'spend',
                'amount' => 22000.00,
                'balance_after' => 478000.00,
                'description' => 'Pembelian Nasi Ayam Geprek & Es Teh Manis',
                'merchant_name' => 'Kantin Al-Barokah',
                'nfc_card_uid' => '04A1B2C3D4',
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(4),
            ],
            [
                'pesantren_id' => $pesantrenId,
                'santri_id' => $santriId,
                'type' => 'spend',
                'amount' => 45000.00,
                'balance_after' => 433000.00,
                'description' => 'Pembelian Buku Tulis & Sabun Cuci',
                'merchant_name' => 'Koperasi Santri Darul Rahman',
                'nfc_card_uid' => '04A1B2C3D4',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
            [
                'pesantren_id' => $pesantrenId,
                'santri_id' => $santriId,
                'type' => 'spend',
                'amount' => 48000.00,
                'balance_after' => 385000.00,
                'description' => 'Laundry Pakaian Seragam & Sarung (4 kg)',
                'merchant_name' => 'Laundry Pesantren Barokah',
                'nfc_card_uid' => '04A1B2C3D4',
                'created_at' => Carbon::now()->subHours(8),
                'updated_at' => Carbon::now()->subHours(8),
            ],
        ]);

        // 6. Nilai / Akademik
        $subjects = [
            ['subject' => 'Tahfidzul Quran', 'score' => 96.5, 'grade' => 'A+', 'teacher' => 'Ust. Dr. Abdul Halim, M.Ag'],
            ['subject' => 'Nahwu (Jurumiyyah & Imrithi)', 'score' => 91.0, 'grade' => 'A', 'teacher' => 'Ust. Zarkasyi, S.Pd.I'],
            ['subject' => 'Shorof (Al-Maqshud)', 'score' => 88.5, 'grade' => 'A', 'teacher' => 'Ust. Zarkasyi, S.Pd.I'],
            ['subject' => 'Fiqih (Fathul Qorib)', 'score' => 93.0, 'grade' => 'A', 'teacher' => 'K.H. Syamsudin Ahmad'],
            ['subject' => 'Bahasa Arab (Muhadatsah)', 'score' => 89.0, 'grade' => 'A', 'teacher' => 'Ust. Salman Al-Farisi, Lc.'],
            ['subject' => 'Bahasa Inggris', 'score' => 86.0, 'grade' => 'B+', 'teacher' => 'Ust. Fauzan, M.Pd'],
            ['subject' => 'Matematika Terapan', 'score' => 85.0, 'grade' => 'B+', 'teacher' => 'Ust. Hendra Wijaya, S.Si'],
        ];

        foreach ($subjects as $sub) {
            DB::table('nilais')->insert([
                'pesantren_id' => $pesantrenId,
                'santri_id' => $santriId,
                'semester' => 'Semester Ganjil 2026/2027',
                'subject' => $sub['subject'],
                'score' => $sub['score'],
                'grade' => $sub['grade'],
                'teacher_name' => $sub['teacher'],
                'feedback' => 'Pemahaman sangat baik, aktif saat diskusi halaqah.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7. Hafalan / Muhafadzoh
        DB::table('hafalans')->insert([
            [
                'pesantren_id' => $pesantrenId,
                'santri_id' => $santriId,
                'surah' => 'Surah Al-Kahf',
                'ayat_range' => 'Ayat 1 - 110 (Khatam)',
                'juz' => 'Juz 15 & 16',
                'kualitas' => 'Mumtaz',
                'musyrif_name' => 'Ust. Dr. Abdul Halim, M.Ag',
                'notes' => 'Makharijul huruf dan tajwid sangat fasih.',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'pesantren_id' => $pesantrenId,
                'santri_id' => $santriId,
                'surah' => 'Surah Maryam',
                'ayat_range' => 'Ayat 1 - 50',
                'juz' => 'Juz 16',
                'kualitas' => 'Jayyid Jiddan',
                'musyrif_name' => 'Ust. Dr. Abdul Halim, M.Ag',
                'notes' => 'Irama tartil sudah bagus, perlu diperhatikan mad wajib muttashil.',
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
            [
                'pesantren_id' => $pesantrenId,
                'santri_id' => $santriId,
                'surah' => 'Nazhom Alfiyah Ibnu Malik',
                'ayat_range' => 'Bait 1 - 150',
                'juz' => 'Kalam & I’rab',
                'kualitas' => 'Mumtaz',
                'musyrif_name' => 'Ust. Zarkasyi, S.Pd.I',
                'notes' => 'Hafal lancar bil ghaib beserta arti.',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ],
        ]);

        // 8. Absensi Harian Santri
        $dates = [Carbon::now()->format('Y-m-d'), Carbon::now()->subDays(1)->format('Y-m-d')];
        $activities = ['Sholat Shubuh', 'KBM Pagi', 'Sholat Dzuhur', 'KBM Sore', 'Sholat Ashar', 'Sholat Maghrib', 'Halaqah Tahfidz', 'Sholat Isya'];

        foreach ($dates as $d) {
            foreach ($activities as $act) {
                DB::table('absensis')->insert([
                    'pesantren_id' => $pesantrenId,
                    'santri_id' => $santriId,
                    'date' => $d,
                    'activity' => $act,
                    'status' => 'Hadir',
                    'notes' => 'Tepat waktu di Masjid Jami',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 9. Perizinan Pulang
        DB::table('perizinans')->insert([
            'pesantren_id' => $pesantrenId,
            'santri_id' => $santriId,
            'wali_id' => $waliId,
            'reason' => 'Acara Pernikahan Kakak Kandung & Silaturahmi Keluarga',
            'description' => 'Mohon izin ananda Muhammad Farhan dapat pulang untuk menghadiri akad nikah kakak kandung di Cilandak.',
            'start_date' => Carbon::now()->addDays(2)->setTime(9, 0, 0),
            'end_date' => Carbon::now()->addDays(5)->setTime(17, 0, 0),
            'actual_return_date' => null,
            'attachment_url' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
            'status' => 'approved',
            'approved_by' => 'Ust. H. Syarifudin (Biro Keamanan & Kepesantrenan)',
            'qr_code_token' => 'QR-IZIN-202609-0078',
            'created_at' => Carbon::now()->subDays(1),
            'updated_at' => now(),
        ]);

        // 10. Pengumuman
        DB::table('pengumumans')->insert([
            [
                'pesantren_id' => $pesantrenId,
                'title' => 'Peringatan Maulid Nabi Muhammad SAW 1448 H',
                'content' => 'Diberitahukan kepada seluruh wali santri bahwa Pesantren Darul Rahman akan menyelenggarakan Tabligh Akbar Peringatan Maulid Nabi SAW bersama Para Habaib dan Ulama pada hari Ahad mendatang.',
                'category' => 'Kegiatan',
                'image_url' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
                'is_pinned' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'pesantren_id' => $pesantrenId,
                'title' => 'Sosialisasi Sistem Pembayaran Digital KaseraPay & SiPesand',
                'content' => 'Untuk mempermudah wali santri dalam melakukan pembayaran SPP dan top-up uang saku non-tunai anak, kini aplikasi Ananda by SiPesand terintegrasi langsung dengan payment gateway KaseraPay.',
                'category' => 'Keuangan',
                'image_url' => 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&q=80',
                'is_pinned' => false,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ],
        ]);

        // 11. Chat Rooms & Messages
        $roomMusyrifId = DB::table('chat_rooms')->insertGetId([
            'pesantren_id' => $pesantrenId,
            'wali_id' => $waliId,
            'santri_id' => $santriId,
            'title' => 'Musyrif Kamar Al-Fatih 04',
            'role_target' => 'Musyrif',
            'target_name' => 'Ust. Rahmat Hidayat, Lc.',
            'target_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            'last_message' => 'Alhamdulillah perkembangan hafalan Ananda Farhan sangat pesat Pak Haji.',
            'last_message_at' => Carbon::now()->subHours(2),
            'unread_wali_count' => 1,
            'created_at' => Carbon::now()->subDays(10),
            'updated_at' => Carbon::now()->subHours(2),
        ]);

        DB::table('chat_messages')->insert([
            [
                'chat_room_id' => $roomMusyrifId,
                'sender_type' => 'wali',
                'sender_name' => 'H. Ahmad Fauzi',
                'type' => 'text',
                'message' => 'Assalamu’alaikum Ustadz Rahmat, bagaimana kondisi kesehatan dan belajar ananda Farhan?',
                'media_url' => null,
                'is_read' => true,
                'created_at' => Carbon::now()->subHours(4),
                'updated_at' => Carbon::now()->subHours(4),
            ],
            [
                'chat_room_id' => $roomMusyrifId,
                'sender_type' => 'pesantren',
                'sender_name' => 'Ust. Rahmat Hidayat, Lc.',
                'type' => 'text',
                'message' => 'Wa’alaikumsalam Warahmatullahi Wabarakatuh. Alhamdulillah Farhan sehat wal ‘afiyat. Ananda sangat rajin sholat berjamaah di shaf depan.',
                'media_url' => null,
                'is_read' => true,
                'created_at' => Carbon::now()->subHours(3),
                'updated_at' => Carbon::now()->subHours(3),
            ],
            [
                'chat_room_id' => $roomMusyrifId,
                'sender_type' => 'pesantren',
                'sender_name' => 'Ust. Rahmat Hidayat, Lc.',
                'type' => 'text',
                'message' => 'Alhamdulillah perkembangan hafalan Ananda Farhan sangat pesat Pak Haji.',
                'media_url' => null,
                'is_read' => false,
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ],
        ]);

        $roomBendaharaId = DB::table('chat_rooms')->insertGetId([
            'pesantren_id' => $pesantrenId,
            'wali_id' => $waliId,
            'santri_id' => $santriId,
            'title' => 'Bendahara & Administrasi Keuangan',
            'role_target' => 'Bendahara',
            'target_name' => 'Ustadzah Siti Fatimah, S.E.',
            'target_avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            'last_message' => 'Kwitansi resmi pembayaran bulan Agustus sudah terbit dan dapat diunduh.',
            'last_message_at' => Carbon::now()->subDays(3),
            'unread_wali_count' => 0,
            'created_at' => Carbon::now()->subDays(15),
            'updated_at' => Carbon::now()->subDays(3),
        ]);

        DB::table('chat_messages')->insert([
            [
                'chat_room_id' => $roomBendaharaId,
                'sender_type' => 'pesantren',
                'sender_name' => 'Ustadzah Siti Fatimah',
                'type' => 'text',
                'message' => 'Kwitansi resmi pembayaran bulan Agustus sudah terbit dan dapat diunduh.',
                'media_url' => null,
                'is_read' => true,
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ],
        ]);

        // 12. Wali Notifications
        DB::table('wali_notifications')->insert([
            [
                'pesantren_id' => $pesantrenId,
                'wali_id' => $waliId,
                'title' => 'Tagihan SPP Baru Telah Terbit',
                'body' => 'Tagihan SPP & Operasional Bulan September 2026 sebesar Rp 452.500 telah tersedia.',
                'type' => 'bill',
                'action_url' => '/keuangan',
                'is_read' => false,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'pesantren_id' => $pesantrenId,
                'wali_id' => $waliId,
                'title' => 'Pesan Baru dari Musyrif Kamar',
                'body' => 'Ust. Rahmat Hidayat mengirimkan update seputar hafalan Farhan.',
                'type' => 'chat',
                'action_url' => '/chat/' . $roomMusyrifId,
                'is_read' => false,
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ],
            [
                'pesantren_id' => $pesantrenId,
                'wali_id' => $waliId,
                'title' => 'Perizinan Pulang Disetujui',
                'body' => 'Pengajuan izin kepulangan ananda Muhammad Farhan telah disetujui Biro Kepesantrenan.',
                'type' => 'permit',
                'action_url' => '/perizinan',
                'is_read' => true,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
        ]);
    }
}
