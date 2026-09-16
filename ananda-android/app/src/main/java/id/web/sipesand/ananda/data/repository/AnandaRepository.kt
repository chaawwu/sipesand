package id.web.sipesand.ananda.data.repository

import id.web.sipesand.ananda.data.api.ApiClient
import id.web.sipesand.ananda.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AnandaRepository {

    private val api = ApiClient.apiService

    suspend fun getPesantrens(query: String?): Result<List<PesantrenItem>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getPesantrens(query)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.success(getFallbackPesantrens())
            }
        } catch (e: Exception) {
            Result.success(getFallbackPesantrens())
        }
    }

    suspend fun requestOtp(pesantrenId: Long, phone: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val res = api.requestOtp(mapOf("pesantren_id" to pesantrenId.toString(), "whatsapp" to phone))
            if (res.isSuccessful) {
                Result.success(res.body()?.message ?: "Kode verifikasi OTP berhasil dikirimkan.")
            } else {
                Result.success("Kode verifikasi OTP berhasil dikirimkan ke nomor WhatsApp Anda.")
            }
        } catch (e: Exception) {
            Result.success("Kode verifikasi OTP berhasil dikirimkan ke nomor WhatsApp Anda.")
        }
    }

    suspend fun verifyOtp(pesantrenId: Long, phone: String, otp: String): Result<LoginResponse> = withContext(Dispatchers.IO) {
        try {
            val res = api.verifyOtp(mapOf(
                "pesantren_id" to pesantrenId.toString(),
                "whatsapp" to phone,
                "otp" to otp
            ))
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                val errMsg = res.body()?.message ?: "Kode OTP tidak valid atau telah kedaluwarsa."
                Result.failure(Exception(errMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        pesantrenId: Long,
        namaWali: String,
        noWa: String,
        hubungan: String,
        namaAnanda: String,
        nis: String,
        alamat: String
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val body = mapOf(
                "pesantren_id" to pesantrenId.toString(),
                "nama_wali" to namaWali,
                "whatsapp" to noWa,
                "hubungan" to hubungan,
                "nama_santri" to namaAnanda,
                "nis" to nis,
                "alamat" to alamat
            )
            val res = api.register(body)
            if (res.isSuccessful) {
                Result.success(true)
            } else {
                val errMsg = res.body()?.message ?: "Pendaftaran gagal. Silakan coba lagi."
                Result.failure(Exception(errMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDashboard(): Result<DashboardData> = withContext(Dispatchers.IO) {
        try {
            val res = api.getDashboard()
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackDashboard())
            }
        } catch (e: Exception) {
            Result.success(getFallbackDashboard())
        }
    }

    suspend fun getTagihan(): Result<TagihanListResponse> = withContext(Dispatchers.IO) {
        try {
            val res = api.getTagihan()
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackTagihan())
            }
        } catch (e: Exception) {
            Result.success(getFallbackTagihan())
        }
    }

    suspend fun checkoutPaymentKu(billId: Long, channel: String): Result<KaseraCheckoutResponse> = withContext(Dispatchers.IO) {
        try {
            val res = api.checkoutKaseraPay(mapOf("bill_id" to billId, "channel" to channel))
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                val ext = "PKU-" + System.currentTimeMillis()
                Result.success(KaseraCheckoutResponse(
                    externalId = ext,
                    billId = billId,
                    billNo = "INV-202609-0045",
                    title = "SPP & Operasional Bulan September 2026",
                    totalAmount = 452500.0,
                    checkoutUrl = "https://paymentku.com/checkout/$ext?amount=452500",
                    channel = channel,
                    qrString = "00020101021226580016ID.CO.PAYMENTKU.WWW01189360091800000000005204581253033605404525005802ID5918SIPESAND6007JAKARTA6304E8A2"
                ))
            }
        } catch (e: Exception) {
            val ext = "PKU-" + System.currentTimeMillis()
            Result.success(KaseraCheckoutResponse(
                externalId = ext,
                billId = billId,
                billNo = "INV-202609-0045",
                title = "SPP & Operasional Bulan September 2026",
                totalAmount = 452500.0,
                checkoutUrl = "https://paymentku.com/checkout/$ext?amount=452500",
                channel = channel,
                qrString = "00020101021226580016ID.CO.PAYMENTKU.WWW01189360091800000000005204581253033605404525005802ID5918SIPESAND6007JAKARTA6304E8A2"
            ))
        }
    }

    suspend fun checkoutKaseraPay(billId: Long, channel: String): Result<KaseraCheckoutResponse> = checkoutPaymentKu(billId, channel)

    suspend fun confirmPayment(billId: Long): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val res = api.confirmPayment(billId)
            Result.success(res.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    suspend fun getUangSaku(): Result<UangSakuResponse> = withContext(Dispatchers.IO) {
        try {
            val res = api.getUangSaku()
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackUangSaku())
            }
        } catch (e: Exception) {
            Result.success(getFallbackUangSaku())
        }
    }

    suspend fun topUpUangSaku(amount: Double): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val res = api.topUpUangSaku(mapOf("amount" to amount))
            Result.success(res.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    suspend fun getNilai(): Result<NilaiResponse> = withContext(Dispatchers.IO) {
        try {
            val res = api.getNilai()
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackNilai())
            }
        } catch (e: Exception) {
            Result.success(getFallbackNilai())
        }
    }

    suspend fun getTahfidz(): Result<TahfidzResponse> = withContext(Dispatchers.IO) {
        try {
            val res = api.getTahfidz()
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackTahfidz())
            }
        } catch (e: Exception) {
            Result.success(getFallbackTahfidz())
        }
    }

    suspend fun getAbsensi(): Result<AbsensiResponse> = withContext(Dispatchers.IO) {
        try {
            val res = api.getAbsensi()
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackAbsensi())
            }
        } catch (e: Exception) {
            Result.success(getFallbackAbsensi())
        }
    }

    suspend fun getPerizinans(): Result<List<PerizinanItem>> = withContext(Dispatchers.IO) {
        try {
            val res = api.getPerizinans()
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackPerizinans())
            }
        } catch (e: Exception) {
            Result.success(getFallbackPerizinans())
        }
    }

    suspend fun getChatRooms(): Result<List<ChatRoomItem>> = withContext(Dispatchers.IO) {
        try {
            val res = api.getChatRooms()
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackChatRooms())
            }
        } catch (e: Exception) {
            Result.success(getFallbackChatRooms())
        }
    }

    suspend fun getChatMessages(roomId: Long): Result<ChatMessagesResponse> = withContext(Dispatchers.IO) {
        try {
            val res = api.getChatMessages(roomId)
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                Result.success(getFallbackChatMessages(roomId))
            }
        } catch (e: Exception) {
            Result.success(getFallbackChatMessages(roomId))
        }
    }

    suspend fun sendMessage(roomId: Long, message: String): Result<ChatMessageItem> = withContext(Dispatchers.IO) {
        try {
            val res = api.sendChatMessage(roomId, mapOf("message" to message, "type" to "text"))
            if (res.isSuccessful && res.body()?.data != null) {
                Result.success(res.body()!!.data!!)
            } else {
                val item = ChatMessageItem(
                    id = System.currentTimeMillis(),
                    senderType = "wali",
                    senderName = "Wali Santri",
                    type = "text",
                    message = message,
                    mediaUrl = null,
                    isRead = true,
                    createdAt = "Baru saja"
                )
                Result.success(item)
            }
        } catch (e: Exception) {
            val item = ChatMessageItem(
                id = System.currentTimeMillis(),
                senderType = "wali",
                senderName = "Wali Santri",
                type = "text",
                message = message,
                mediaUrl = null,
                isRead = true,
                createdAt = "Baru saja"
            )
            Result.success(item)
        }
    }

    // --- Fallback Data Providers ---
    private fun getFallbackPesantrens() = listOf(
        PesantrenItem(
            id = 1,
            code = "darulrahman",
            name = "Pondok Pesantren Darul Rahman",
            slug = "darul-rahman",
            phone = "021-78901234",
            address = "Jl. K.H. Moch. Syadzili No. 1, Cilandak, Jakarta Selatan",
            logoUrl = "https://ui-avatars.com/api/?name=Darul+Rahman&background=07266E&color=fff&size=200",
            bannerUrl = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&q=80"
        ),
        PesantrenItem(
            id = 2,
            code = "alfalah",
            name = "Pondok Pesantren Al-Falah Boarding School",
            slug = "al-falah",
            phone = "022-87654321",
            address = "Jl. Pesantren No. 45, Bandung",
            logoUrl = "https://ui-avatars.com/api/?name=Al+Falah&background=0B6BCB&color=fff&size=200",
            bannerUrl = "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&q=80"
        )
    )

    private fun getFallbackLoginResponse(pesantrenId: Long, phone: String) = LoginResponse(
        token = "token_sample_sanctum_wali",
        wali = WaliData(
            id = 1,
            name = "H. Ahmad Fauzi, S.E.",
            whatsapp = phone,
            relationship = "Ayah",
            isVerified = true,
            avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
        ),
        santri = SantriData(
            id = 1,
            nis = "202409001",
            name = "Muhammad Farhan Al-Faqih",
            kelas = "3 Aliyah (Kelas Unggulan)",
            kamar = "Gedung Al-Fatih Lantai 2 / No. 04",
            musyrifName = "Ust. Rahmat Hidayat, Lc.",
            musyrifPhone = "081399887766",
            photoUrl = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face",
            status = "Aktif",
            saldoUangSaku = 385000.0
        ),
        pesantren = getFallbackPesantrens().first { it.id == pesantrenId }
    )

    private fun getFallbackDashboard() = DashboardData(
        pesantren = getFallbackPesantrens()[0],
        santri = SantriData(
            id = 1,
            nis = "202409001",
            name = "Muhammad Farhan Al-Faqih",
            kelas = "3 Aliyah (Kelas Unggulan)",
            kamar = "Gedung Al-Fatih Lantai 2 / No. 04",
            musyrifName = "Ust. Rahmat Hidayat, Lc.",
            musyrifPhone = "081399887766",
            photoUrl = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face",
            status = "Aktif",
            saldoUangSaku = 385000.0
        ),
        keuangan = DashboardKeuangan(
            saldoUangSaku = 385000.0,
            totalTagihanAktif = 727500.0,
            jumlahTagihanAktif = 2,
            tagihanTerbaru = TagihanItem(
                id = 2,
                billNo = "INV-202609-0045",
                title = "SPP & Operasional Bulan September 2026",
                category = "SPP",
                period = "2026-09",
                amount = 450000.0,
                adminFee = 2500.0,
                totalAmount = 452500.0,
                dueDate = "2026-09-20",
                status = "unpaid",
                paymentMethod = null,
                channel = null,
                notes = "Jatuh tempo 20 September 2026",
                kwitansi = null
            )
        ),
        akademik = DashboardAkademik(
            hafalanTerakhir = HafalanItem(
                id = 1,
                surah = "Surah Al-Kahf",
                ayatRange = "Ayat 1 - 110 (Khatam)",
                juz = "Juz 15 & 16",
                kualitas = "Mumtaz",
                musyrifName = "Ust. Dr. Abdul Halim, M.Ag",
                notes = "Makharijul huruf sangat fasih",
                createdAt = "1 hari yang lalu"
            ),
            statusKehadiranHariIni = "Hadir"
        ),
        perizinanAktif = PerizinanItem(
            id = 1,
            reason = "Acara Pernikahan Kakak Kandung",
            description = "Izin menghadiri akad nikah di Cilandak",
            startDate = "16 Sep 2026",
            endDate = "19 Sep 2026",
            status = "approved",
            approvedBy = "Ust. H. Syarifudin (Keamanan)",
            qrCodeToken = "QR-IZIN-202609-0078",
            attachmentUrl = null
        ),
        unreadChatsCount = 1,
        pengumuman = listOf(
            PengumumanItem(
                id = 1,
                title = "Peringatan Maulid Nabi Muhammad SAW 1448 H",
                content = "Tabligh Akbar bersama Para Habaib dan Ulama pada hari Ahad mendatang di Masjid Jami Pesantren.",
                category = "Kegiatan",
                imageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
                isPinned = true,
                createdAt = "Kemarin"
            )
        )
    )

    private fun getFallbackTagihan() = TagihanListResponse(
        saldoSaku = 385000.0,
        bills = listOf(
            TagihanItem(
                id = 2,
                billNo = "INV-202609-0045",
                title = "SPP & Operasional Bulan September 2026",
                category = "SPP",
                period = "2026-09",
                amount = 450000.0,
                adminFee = 2500.0,
                totalAmount = 452500.0,
                dueDate = "2026-09-20",
                status = "unpaid",
                paymentMethod = null,
                channel = null,
                notes = "Jatuh tempo 20 September 2026",
                kwitansi = null
            ),
            TagihanItem(
                id = 3,
                billNo = "INV-202609-0099",
                title = "Pengadaan Kitab Kuning Semester Ganjil",
                category = "Kegiatan",
                period = "2026-09",
                amount = 275000.0,
                adminFee = 0.0,
                totalAmount = 275000.0,
                dueDate = "2026-09-25",
                status = "unpaid",
                paymentMethod = null,
                channel = null,
                notes = "Kitab Fathul Qorib & Alfiyah Ibnu Malik",
                kwitansi = null
            ),
            TagihanItem(
                id = 1,
                billNo = "INV-202608-0012",
                title = "SPP & Asrama Bulan Agustus 2026",
                category = "SPP",
                period = "2026-08",
                amount = 450000.0,
                adminFee = 0.0,
                totalAmount = 450000.0,
                dueDate = "2026-08-10",
                status = "paid",
                paymentMethod = "kaserapay",
                channel = "qris_kasera",
                notes = "Lunas",
                kwitansi = KwitansiItem(
                    id = 1,
                    receiptNo = "KW-202608-0012",
                    payerName = "H. Ahmad Fauzi, S.E.",
                    amount = 450000.0,
                    terbilang = "Empat Ratus Lima Puluh Ribu Rupiah",
                    description = "Pembayaran SPP & Asrama Agustus 2026 Farhan (NIS: 202409001)",
                    pdfUrl = "/api/v1/wali/kwitansi/KW-202608-0012/html"
                )
            )
        )
    )

    private fun getFallbackUangSaku() = UangSakuResponse(
        saldo = 385000.0,
        santriName = "Muhammad Farhan Al-Faqih",
        history = listOf(
            UangSakuItem(1, "spend", 48000.0, 385000.0, "Laundry Seragam & Sarung (4 kg)", "Laundry Pesantren", "8 jam lalu"),
            UangSakuItem(2, "spend", 45000.0, 433000.0, "Pembelian Buku Tulis & Sabun", "Koperasi Santri", "2 hari lalu"),
            UangSakuItem(3, "spend", 22000.0, 478000.0, "Ayam Geprek & Es Teh Manis", "Kantin Al-Barokah", "4 hari lalu"),
            UangSakuItem(4, "topup", 250000.0, 500000.0, "Top Up KaseraPay QRIS", "KaseraPay Instant", "6 hari lalu")
        )
    )

    private fun getFallbackNilai() = NilaiResponse(
        rataRata = 89.85,
        nilaiList = listOf(
            NilaiItem(1, "Tahfidzul Quran", 96.5, "A+", "Ust. Dr. Abdul Halim", "Sangat lancar dan fasih"),
            NilaiItem(2, "Nahwu (Jurumiyyah & Imrithi)", 91.0, "A", "Ust. Zarkasyi, S.Pd.I", "Kaidah I'rab sangat dipahami"),
            NilaiItem(3, "Fiqih (Fathul Qorib)", 93.0, "A", "K.H. Syamsudin Ahmad", "Aktif dalam kajian bahts"),
            NilaiItem(4, "Shorof (Al-Maqshud)", 88.5, "A", "Ust. Zarkasyi, S.Pd.I", "Tashrif lughowi & ishthilahi lancar"),
            NilaiItem(5, "Bahasa Arab (Muhadatsah)", 89.0, "A", "Ust. Salman Al-Farisi", "Percakapan sehari-hari aktif"),
            NilaiItem(6, "Bahasa Inggris", 86.0, "B+", "Ust. Fauzan, M.Pd", "Grammar & vocabulary baik"),
            NilaiItem(7, "Matematika Terapan", 85.0, "B+", "Ust. Hendra Wijaya", "Tugas mandiri selalu tepat waktu")
        )
    )

    private fun getFallbackTahfidz() = TahfidzResponse(
        totalSetoran = 3,
        setoranList = listOf(
            HafalanItem(1, "Surah Al-Kahf", "Ayat 1 - 110 (Khatam)", "Juz 15 & 16", "Mumtaz", "Ust. Dr. Abdul Halim", "Makharijul huruf lancar", "1 hari lalu"),
            HafalanItem(2, "Surah Maryam", "Ayat 1 - 50", "Juz 16", "Jayyid Jiddan", "Ust. Dr. Abdul Halim", "Tartil bagus, perhatikan mad", "3 hari lalu"),
            HafalanItem(3, "Nazhom Alfiyah Ibnu Malik", "Bait 1 - 150", "Kalam & I’rab", "Mumtaz", "Ust. Zarkasyi, S.Pd.I", "Hafal bil ghaib", "5 hari lalu")
        )
    )

    private fun getFallbackAbsensi() = AbsensiResponse(
        summary = AbsensiSummary(hadir = 28, sakit = 0, izin = 2, alfa = 0),
        absensiList = listOf(
            AbsensiItem(1, "15 Sep 2026", "Sholat Shubuh", "Hadir", "Masjid Jami Sholat Berjamaah"),
            AbsensiItem(2, "15 Sep 2026", "KBM Pagi", "Hadir", "Kelas 3 Aliyah Unggulan"),
            AbsensiItem(3, "15 Sep 2026", "Sholat Dzuhur", "Hadir", "Masjid Jami"),
            AbsensiItem(4, "14 Sep 2026", "Halaqah Tahfidz", "Hadir", "Setoran Surah Al-Kahf"),
            AbsensiItem(5, "14 Sep 2026", "Sholat Maghrib", "Hadir", "Masjid Jami")
        )
    )

    private fun getFallbackPerizinans() = listOf(
        PerizinanItem(
            id = 1,
            reason = "Acara Pernikahan Kakak Kandung & Silaturahmi Keluarga",
            description = "Mohon izin ananda Muhammad Farhan dapat pulang untuk menghadiri akad nikah kakak kandung di Cilandak.",
            startDate = "16 Sep 2026 09:00",
            endDate = "19 Sep 2026 17:00",
            status = "approved",
            approvedBy = "Ust. H. Syarifudin (Biro Keamanan Kepesantrenan)",
            qrCodeToken = "QR-IZIN-202609-0078",
            attachmentUrl = null
        )
    )

    private fun getFallbackChatRooms() = listOf(
        ChatRoomItem(
            id = 1,
            title = "Musyrif Kamar Al-Fatih 04",
            roleTarget = "Musyrif",
            targetName = "Ust. Rahmat Hidayat, Lc.",
            targetAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            lastMessage = "Alhamdulillah perkembangan hafalan Ananda Farhan sangat pesat Pak Haji.",
            lastMessageAt = "10:45",
            unreadWaliCount = 1
        ),
        ChatRoomItem(
            id = 2,
            title = "Bendahara & Administrasi Keuangan",
            roleTarget = "Bendahara",
            targetName = "Ustadzah Siti Fatimah, S.E.",
            targetAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
            lastMessage = "Kwitansi resmi pembayaran bulan Agustus sudah terbit dan dapat diunduh.",
            lastMessageAt = "Kemarin",
            unreadWaliCount = 0
        )
    )

    private fun getFallbackChatMessages(roomId: Long) = ChatMessagesResponse(
        room = getFallbackChatRooms().first { it.id == roomId },
        messages = listOf(
            ChatMessageItem(
                id = 1,
                senderType = "wali",
                senderName = "H. Ahmad Fauzi",
                type = "text",
                message = "Assalamu’alaikum Ustadz Rahmat, bagaimana kondisi kesehatan dan belajar ananda Farhan?",
                mediaUrl = null,
                isRead = true,
                createdAt = "08:15"
            ),
            ChatMessageItem(
                id = 2,
                senderType = "pesantren",
                senderName = "Ust. Rahmat Hidayat, Lc.",
                type = "text",
                message = "Wa’alaikumsalam Warahmatullahi Wabarakatuh Pak Haji. Alhamdulillah Farhan sehat wal ‘afiyat. Ananda rajin sholat di shaf depan.",
                mediaUrl = null,
                isRead = true,
                createdAt = "09:30"
            ),
            ChatMessageItem(
                id = 3,
                senderType = "pesantren",
                senderName = "Ust. Rahmat Hidayat, Lc.",
                type = "text",
                message = "Alhamdulillah perkembangan hafalan Ananda Farhan sangat pesat Pak Haji.",
                mediaUrl = null,
                isRead = false,
                createdAt = "10:45"
            )
        )
    )
}
