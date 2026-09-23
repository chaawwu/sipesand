package id.web.sipesand.ananda.data.api

import id.web.sipesand.ananda.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @GET("api/v1/wali/pesantrens") suspend fun pesantrens(@Query("q") q:String?=null): Response<ApiResponse<List<PesantrenItem>>>
    @POST("api/v1/wali/auth/request-otp") suspend fun requestOtp(@Body b:Map<String,String>): Response<ApiResponse<Map<String,Any>>>
    @POST("api/v1/wali/auth/verify-otp") suspend fun verifyOtp(@Body b:Map<String,String>): Response<ApiResponse<LoginResponse>>
    @POST("api/v1/wali/auth/register") suspend fun register(@Body b:Map<String,String>): Response<ApiResponse<Map<String,Any>>>
    @GET("api/v1/wali/auth/me") suspend fun me(): Response<ApiResponse<Map<String,Any>>>
    @GET("api/v1/wali/dashboard") suspend fun dashboard(): Response<ApiResponse<DashboardData>>
    @GET("api/v1/wali/keuangan/tagihan") suspend fun tagihan(@Query("status") s:String?=null): Response<ApiResponse<TagihanListResponse>>
    @POST("api/v1/wali/keuangan/checkout") suspend fun checkout(@Body b:Map<String,Any>): Response<ApiResponse<KaseraCheckoutResponse>>
    @POST("api/v1/wali/keuangan/confirm-payment/{id}") suspend fun confirm(@Path("id") id:Long): Response<ApiResponse<Map<String,Any>>>
    @GET("api/v1/wali/keuangan/uang-saku") suspend fun uangSaku(): Response<ApiResponse<UangSakuResponse>>
    @POST("api/v1/wali/keuangan/uang-saku/topup") suspend fun topUp(@Body b:Map<String,Any>): Response<ApiResponse<Map<String,Any>>>
    @GET("api/v1/wali/kwitansi/{no}") suspend fun kwitansi(@Path("no") no:String): Response<ApiResponse<Map<String,Any>>>
    @GET("api/v1/wali/akademik/nilai") suspend fun nilai(): Response<ApiResponse<NilaiResponse>>
    @GET("api/v1/wali/akademik/tahfidz") suspend fun tahfidz(): Response<ApiResponse<TahfidzResponse>>
    @GET("api/v1/wali/akademik/absensi") suspend fun absensi(@Query("month") m:String?=null): Response<ApiResponse<AbsensiResponse>>
    @GET("api/v1/wali/perizinan") suspend fun perizinan(): Response<ApiResponse<List<PerizinanItem>>>
    @POST("api/v1/wali/perizinan") suspend fun ajukanIzin(@Body b:Map<String,String>): Response<ApiResponse<PerizinanItem>>
    @GET("api/v1/wali/chat/rooms") suspend fun chatRooms(): Response<ApiResponse<List<ChatRoomItem>>>
    @GET("api/v1/wali/chat/rooms/{id}/messages") suspend fun chatMessages(@Path("id") id:Long): Response<ApiResponse<ChatMessagesResponse>>
    @POST("api/v1/wali/chat/rooms/{id}/messages") suspend fun sendChat(@Path("id") id:Long, @Body b:Map<String,String>): Response<ApiResponse<ChatMessageItem>>
    @GET("api/v1/wali/notifications") suspend fun notifs(): Response<ApiResponse<List<Map<String,Any>>>>
}
