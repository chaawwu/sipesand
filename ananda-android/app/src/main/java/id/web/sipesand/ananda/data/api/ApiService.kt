package id.web.sipesand.ananda.data.api

import id.web.sipesand.ananda.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // 1. Auth & Pesantrens
    @GET("api/v1/wali/pesantrens")
    suspend fun getPesantrens(
        @Query("q") query: String? = null
    ): Response<ApiResponse<List<PesantrenItem>>>

    @POST("api/v1/wali/auth/request-otp")
    suspend fun requestOtp(
        @Body body: Map<String, String>
    ): Response<ApiResponse<Map<String, Any>>>

    @POST("api/v1/wali/auth/verify-otp")
    suspend fun verifyOtp(
        @Body body: Map<String, String>
    ): Response<ApiResponse<LoginResponse>>

    @POST("api/v1/wali/auth/register")
    suspend fun register(
        @Body body: Map<String, String>
    ): Response<ApiResponse<LoginResponse>>

    @GET("api/v1/wali/auth/me")
    suspend fun getMe(): Response<ApiResponse<Map<String, Any>>>

    // 2. Dashboard
    @GET("api/v1/wali/dashboard")
    suspend fun getDashboard(): Response<ApiResponse<DashboardData>>

    // 3. Keuangan & Tagihan
    @GET("api/v1/wali/keuangan/tagihan")
    suspend fun getTagihan(
        @Query("status") status: String? = null
    ): Response<ApiResponse<TagihanListResponse>>

    @POST("api/v1/wali/keuangan/checkout")
    suspend fun checkoutKaseraPay(
        @Body body: Map<String, Any>
    ): Response<ApiResponse<KaseraCheckoutResponse>>

    @POST("api/v1/wali/keuangan/confirm-payment/{id}")
    suspend fun confirmPayment(
        @Path("id") id: Long
    ): Response<ApiResponse<Map<String, Any>>>

    @GET("api/v1/wali/keuangan/uang-saku")
    suspend fun getUangSaku(): Response<ApiResponse<UangSakuResponse>>

    @POST("api/v1/wali/keuangan/uang-saku/topup")
    suspend fun topUpUangSaku(
        @Body body: Map<String, Double>
    ): Response<ApiResponse<Map<String, Any>>>

    @GET("api/v1/wali/kwitansi/{receiptNo}")
    suspend fun getKwitansiDetail(
        @Path("receiptNo") receiptNo: String
    ): Response<ApiResponse<Map<String, Any>>>

    // 4. Akademik & Muhafadzoh
    @GET("api/v1/wali/akademik/nilai")
    suspend fun getNilai(): Response<ApiResponse<NilaiResponse>>

    @GET("api/v1/wali/akademik/tahfidz")
    suspend fun getTahfidz(): Response<ApiResponse<TahfidzResponse>>

    @GET("api/v1/wali/akademik/absensi")
    suspend fun getAbsensi(
        @Query("month") month: String? = null
    ): Response<ApiResponse<AbsensiResponse>>

    // 5. Perizinan
    @GET("api/v1/wali/perizinan")
    suspend fun getPerizinans(): Response<ApiResponse<List<PerizinanItem>>>

    @POST("api/v1/wali/perizinan")
    suspend fun submitPerizinan(
        @Body body: Map<String, String>
    ): Response<ApiResponse<PerizinanItem>>

    // 6. Realtime Chat WA-Style
    @GET("api/v1/wali/chat/rooms")
    suspend fun getChatRooms(): Response<ApiResponse<List<ChatRoomItem>>>

    @GET("api/v1/wali/chat/rooms/{roomId}/messages")
    suspend fun getChatMessages(
        @Path("roomId") roomId: Long
    ): Response<ApiResponse<ChatMessagesResponse>>

    @POST("api/v1/wali/chat/rooms/{roomId}/messages")
    suspend fun sendChatMessage(
        @Path("roomId") roomId: Long,
        @Body body: Map<String, String>
    ): Response<ApiResponse<ChatMessageItem>>

    // 7. Notifikasi
    @GET("api/v1/wali/notifications")
    suspend fun getNotifications(): Response<ApiResponse<List<Map<String, Any>>>>
}
