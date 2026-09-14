package id.web.sipesand.ananda.data.model

import com.google.gson.annotations.SerializedName

// Generic API Wrapper
data class ApiResponse<T>(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: T?
)

// 1. Pesantren
data class PesantrenItem(
    @SerializedName("id") val id: Long,
    @SerializedName("code") val code: String,
    @SerializedName("name") val name: String,
    @SerializedName("slug") val slug: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("address") val address: String?,
    @SerializedName("logo_url") val logoUrl: String?,
    @SerializedName("banner_url") val bannerUrl: String?
)

// 2. Auth & Login
data class LoginResponse(
    @SerializedName("token") val token: String,
    @SerializedName("wali") val wali: WaliData,
    @SerializedName("santri") val santri: SantriData?,
    @SerializedName("pesantren") val pesantren: PesantrenItem
)

data class WaliData(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String,
    @SerializedName("whatsapp") val whatsapp: String,
    @SerializedName("relationship") val relationship: String,
    @SerializedName("is_verified") val isVerified: Boolean,
    @SerializedName("avatar_url") val avatarUrl: String?
)

data class SantriData(
    @SerializedName("id") val id: Long,
    @SerializedName("nis") val nis: String,
    @SerializedName("name") val name: String,
    @SerializedName("kelas") val kelas: String?,
    @SerializedName("kamar") val kamar: String?,
    @SerializedName("musyrif_name") val musyrifName: String?,
    @SerializedName("musyrif_phone") val musyrifPhone: String?,
    @SerializedName("photo_url") val photoUrl: String?,
    @SerializedName("status") val status: String?,
    @SerializedName("saldo_uang_saku") val saldoUangSaku: Double = 0.0
)

// 3. Dashboard Response
data class DashboardData(
    @SerializedName("pesantren") val pesantren: PesantrenItem,
    @SerializedName("santri") val santri: SantriData,
    @SerializedName("keuangan") val keuangan: DashboardKeuangan,
    @SerializedName("akademik") val akademik: DashboardAkademik?,
    @SerializedName("perizinan_aktif") val perizinanAktif: PerizinanItem?,
    @SerializedName("unread_chats_count") val unreadChatsCount: Int = 0,
    @SerializedName("pengumuman") val pengumuman: List<PengumumanItem> = emptyList()
)

data class DashboardKeuangan(
    @SerializedName("saldo_uang_saku") val saldoUangSaku: Double,
    @SerializedName("total_tagihan_aktif") val totalTagihanAktif: Double,
    @SerializedName("jumlah_tagihan_aktif") val jumlahTagihanAktif: Int,
    @SerializedName("tagihan_terbaru") val tagihanTerbaru: TagihanItem?
)

data class DashboardAkademik(
    @SerializedName("hafalan_terakhir") val hafalanTerakhir: HafalanItem?,
    @SerializedName("status_kehadiran_hari_ini") val statusKehadiranHariIni: String?
)

// 4. Tagihan & Kwitansi
data class TagihanListResponse(
    @SerializedName("saldo_saku") val saldoSaku: Double,
    @SerializedName("bills") val bills: List<TagihanItem>
)

data class TagihanItem(
    @SerializedName("id") val id: Long,
    @SerializedName("bill_no") val billNo: String,
    @SerializedName("title") val title: String,
    @SerializedName("category") val category: String?,
    @SerializedName("period") val period: String?,
    @SerializedName("amount") val amount: Double,
    @SerializedName("admin_fee") val adminFee: Double = 0.0,
    @SerializedName("total_amount") val totalAmount: Double,
    @SerializedName("due_date") val dueDate: String?,
    @SerializedName("status") val status: String, // unpaid, pending, paid
    @SerializedName("payment_method") val paymentMethod: String?,
    @SerializedName("channel") val channel: String?,
    @SerializedName("notes") val notes: String?,
    @SerializedName("kwitansi") val kwitansi: KwitansiItem?
)

data class KwitansiItem(
    @SerializedName("id") val id: Long,
    @SerializedName("receipt_no") val receiptNo: String,
    @SerializedName("payer_name") val payerName: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("terbilang") val terbilang: String?,
    @SerializedName("description") val description: String,
    @SerializedName("pdf_url") val pdfUrl: String?
)

data class KaseraCheckoutResponse(
    @SerializedName("external_id") val externalId: String,
    @SerializedName("bill_id") val billId: Long,
    @SerializedName("bill_no") val billNo: String,
    @SerializedName("title") val title: String,
    @SerializedName("total_amount") val totalAmount: Double,
    @SerializedName("checkout_url") val checkoutUrl: String,
    @SerializedName("channel") val channel: String,
    @SerializedName("qr_string") val qrString: String?
)

// 5. Uang Saku
data class UangSakuResponse(
    @SerializedName("saldo") val saldo: Double,
    @SerializedName("santri_name") val santriName: String,
    @SerializedName("history") val history: List<UangSakuItem>
)

data class UangSakuItem(
    @SerializedName("id") val id: Long,
    @SerializedName("type") val type: String, // topup, spend
    @SerializedName("amount") val amount: Double,
    @SerializedName("balance_after") val balanceAfter: Double,
    @SerializedName("description") val description: String,
    @SerializedName("merchant_name") val merchantName: String?,
    @SerializedName("created_at") val createdAt: String?
)

// 6. Akademik, Tahfidz & Absensi
data class NilaiResponse(
    @SerializedName("rata_rata") val rataRata: Double,
    @SerializedName("nilai_list") val nilaiList: List<NilaiItem>
)

data class NilaiItem(
    @SerializedName("id") val id: Long,
    @SerializedName("subject") val subject: String,
    @SerializedName("score") val score: Double,
    @SerializedName("grade") val grade: String,
    @SerializedName("teacher_name") val teacherName: String?,
    @SerializedName("feedback") val feedback: String?
)

data class TahfidzResponse(
    @SerializedName("total_setoran") val totalSetoran: Int,
    @SerializedName("setoran_list") val setoranList: List<HafalanItem>
)

data class HafalanItem(
    @SerializedName("id") val id: Long,
    @SerializedName("surah") val surah: String,
    @SerializedName("ayat_range") val ayatRange: String,
    @SerializedName("juz") val juz: String,
    @SerializedName("kualitas") val kualitas: String,
    @SerializedName("musyrif_name") val musyrifName: String?,
    @SerializedName("notes") val notes: String?,
    @SerializedName("created_at") val createdAt: String?
)

data class AbsensiResponse(
    @SerializedName("summary") val summary: AbsensiSummary,
    @SerializedName("absensi_list") val absensiList: List<AbsensiItem>
)

data class AbsensiSummary(
    @SerializedName("hadir") val hadir: Int,
    @SerializedName("sakit") val sakit: Int,
    @SerializedName("izin") val izin: Int,
    @SerializedName("alfa") val alfa: Int
)

data class AbsensiItem(
    @SerializedName("id") val id: Long,
    @SerializedName("date") val date: String,
    @SerializedName("activity") val activity: String,
    @SerializedName("status") val status: String,
    @SerializedName("notes") val notes: String?
)

// 7. Perizinan Pulang
data class PerizinanItem(
    @SerializedName("id") val id: Long,
    @SerializedName("reason") val reason: String,
    @SerializedName("description") val description: String?,
    @SerializedName("start_date") val startDate: String,
    @SerializedName("end_date") val endDate: String,
    @SerializedName("status") val status: String, // pending, approved, rejected
    @SerializedName("approved_by") val approvedBy: String?,
    @SerializedName("qr_code_token") val qrCodeToken: String?,
    @SerializedName("attachment_url") val attachmentUrl: String?
)

// 8. Chat
data class ChatRoomItem(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("role_target") val roleTarget: String,
    @SerializedName("target_name") val targetName: String,
    @SerializedName("target_avatar") val targetAvatar: String?,
    @SerializedName("last_message") val lastMessage: String?,
    @SerializedName("last_message_at") val lastMessageAt: String?,
    @SerializedName("unread_wali_count") val unreadWaliCount: Int = 0
)

data class ChatMessagesResponse(
    @SerializedName("room") val room: ChatRoomItem,
    @SerializedName("messages") val messages: List<ChatMessageItem>
)

data class ChatMessageItem(
    @SerializedName("id") val id: Long,
    @SerializedName("sender_type") val senderType: String, // wali, pesantren
    @SerializedName("sender_name") val senderName: String,
    @SerializedName("type") val type: String, // text, image, document, voice
    @SerializedName("message") val message: String?,
    @SerializedName("media_url") val mediaUrl: String?,
    @SerializedName("is_read") val isRead: Boolean,
    @SerializedName("created_at") val createdAt: String?
)

// 9. Pengumuman
data class PengumumanItem(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("content") val content: String,
    @SerializedName("category") val category: String?,
    @SerializedName("image_url") val imageUrl: String?,
    @SerializedName("is_pinned") val isPinned: Boolean = false,
    @SerializedName("created_at") val createdAt: String?
)
