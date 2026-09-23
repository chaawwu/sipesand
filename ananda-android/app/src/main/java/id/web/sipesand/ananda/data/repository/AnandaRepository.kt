package id.web.sipesand.ananda.data.repository

import id.web.sipesand.ananda.data.api.ApiClient
import id.web.sipesand.ananda.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AnandaRepository {
    private val api = ApiClient.api
    suspend fun pesantrens(q:String?): Result<List<PesantrenItem>> = withContext(Dispatchers.IO){
        try{ val r = api.pesantrens(q); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception(r.body()?.message ?: r.errorBody()?.string()?.take(200) ?: "Gagal memuat pesantren")) } catch(e:Exception){ Result.failure(Exception("Tidak terhubung: ${e.message}")) }
    }
    suspend fun requestOtp(pid:Long, wa:String): Result<String> = withContext(Dispatchers.IO){
        try{ val r=api.requestOtp(mapOf("pesantren_id" to pid.toString(),"whatsapp" to wa)); if(r.isSuccessful) Result.success(r.body()?.message ?: "OTP dikirim") else Result.failure(Exception(r.body()?.message ?: "Gagal kirim OTP")) } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun verifyOtp(pid:Long, wa:String, otp:String): Result<LoginResponse> = withContext(Dispatchers.IO){
        try{ val r=api.verifyOtp(mapOf("pesantren_id" to pid.toString(),"whatsapp" to wa,"otp" to otp)); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception(r.body()?.message ?: "OTP tidak valid")) } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun register(pid:Long, namaWali:String, wa:String, hubungan:String, namaAnanda:String, nis:String, alamat:String): Result<String> = withContext(Dispatchers.IO){
        try{
            val b = mapOf("pesantren_id" to pid.toString(),"name" to namaWali,"whatsapp" to wa,"relationship" to hubungan,"hubungan" to hubungan,"nama_ananda" to namaAnanda,"nis_ananda" to nis,"nis" to nis,"address" to alamat,"alamat" to alamat)
            val r=api.register(b); if(r.isSuccessful) Result.success(r.body()?.message ?: "Pendaftaran berhasil") else Result.failure(Exception(r.body()?.message ?: r.errorBody()?.string()?.take(300) ?: "Registrasi gagal"))
        } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun dashboard(): Result<DashboardData> = withContext(Dispatchers.IO){
        try{ val r=api.dashboard(); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception(r.body()?.message ?: "Gagal dashboard")) } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun tagihan(): Result<TagihanListResponse> = withContext(Dispatchers.IO){
        try{ val r=api.tagihan(); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception(r.body()?.message ?: "Gagal tagihan")) } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun checkout(billId:Long, channel:String): Result<KaseraCheckoutResponse> = withContext(Dispatchers.IO){
        try{ val r=api.checkout(mapOf("bill_id" to billId,"channel" to channel)); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception(r.body()?.message ?: r.errorBody()?.string()?.take(300) ?: "Checkout gagal")) } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun confirm(billId:Long): Result<Boolean> = withContext(Dispatchers.IO){
        try{ val r=api.confirm(billId); if(r.isSuccessful) Result.success(true) else Result.failure(Exception(r.body()?.message ?: "Belum lunas di gateway")) } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun uangSaku(): Result<UangSakuResponse> = withContext(Dispatchers.IO){
        try{ val r=api.uangSaku(); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception(r.body()?.message ?: "Gagal uang saku")) } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun topUp(amount:Double, method:String="transfer_manual"): Result<UangSakuResponse> = withContext(Dispatchers.IO){
        try{
            val r=api.topUp(mapOf("amount" to amount,"payment_method" to method))
            if(r.isSuccessful){
                val refresh = api.uangSaku()
                if(refresh.isSuccessful && refresh.body()?.data!=null) Result.success(refresh.body()!!.data!!) else Result.failure(Exception("Top up ok, refresh gagal"))
            } else Result.failure(Exception(r.body()?.message ?: r.errorBody()?.string()?.take(300) ?: "Top up gagal"))
        } catch(e:Exception){ Result.failure(e) }
    }
    suspend fun nilai(): Result<NilaiResponse> = withContext(Dispatchers.IO){ try{ val r=api.nilai(); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception(r.body()?.message ?: "Gagal nilai")) } catch(e:Exception){ Result.failure(e) } }
    suspend fun tahfidz(): Result<TahfidzResponse> = withContext(Dispatchers.IO){ try{ val r=api.tahfidz(); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception("Gagal tahfidz")) } catch(e:Exception){ Result.failure(e) } }
    suspend fun absensi(month:String?=null): Result<AbsensiResponse> = withContext(Dispatchers.IO){ try{ val r=api.absensi(month); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception("Gagal absensi")) } catch(e:Exception){ Result.failure(e) } }
    suspend fun perizinan(): Result<List<PerizinanItem>> = withContext(Dispatchers.IO){ try{ val r=api.perizinan(); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception("Gagal perizinan")) } catch(e:Exception){ Result.failure(e) } }
    suspend fun ajukanIzin(m:Map<String,String>): Result<PerizinanItem> = withContext(Dispatchers.IO){ try{ val r=api.ajukanIzin(m); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception(r.body()?.message ?: "Gagal ajukan izin")) } catch(e:Exception){ Result.failure(e) } }
    suspend fun chatRooms(): Result<List<ChatRoomItem>> = withContext(Dispatchers.IO){ try{ val r=api.chatRooms(); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception("Gagal chat")) } catch(e:Exception){ Result.failure(e) } }
    suspend fun chatMessages(roomId:Long): Result<ChatMessagesResponse> = withContext(Dispatchers.IO){ try{ val r=api.chatMessages(roomId); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception("Gagal pesan")) } catch(e:Exception){ Result.failure(e) } }
    suspend fun sendChat(roomId:Long, msg:String): Result<ChatMessageItem> = withContext(Dispatchers.IO){ try{ val r=api.sendChat(roomId, mapOf("message" to msg,"type" to "text")); if(r.isSuccessful && r.body()?.data!=null) Result.success(r.body()!!.data!!) else Result.failure(Exception("Gagal kirim")) } catch(e:Exception){ Result.failure(e) } }

    // — Legacy aliases (screens dari backup masih pakai nama lama) —
    suspend fun getPesantrens(q:String?): Result<List<PesantrenItem>> = pesantrens(q)
    suspend fun getDashboard(): Result<DashboardData> = dashboard()
    suspend fun getTagihan(): Result<TagihanListResponse> = tagihan()
    suspend fun getUangSaku(): Result<UangSakuResponse> = uangSaku()
    suspend fun getNilai(): Result<NilaiResponse> = nilai()
    suspend fun getTahfidz(): Result<TahfidzResponse> = tahfidz()
    suspend fun getAbsensi(month:String?=null): Result<AbsensiResponse> = absensi(month)
    suspend fun getPerizinans(): Result<List<PerizinanItem>> = perizinan()
    suspend fun getChatRooms(): Result<List<ChatRoomItem>> = chatRooms()
    suspend fun getChatMessages(id:Long): Result<ChatMessagesResponse> = chatMessages(id)
    suspend fun sendMessage(id:Long, m:String): Result<ChatMessageItem> = sendChat(id,m)
    suspend fun checkoutPaymentKu(billId:Long, ch:String): Result<KaseraCheckoutResponse> = checkout(billId,ch)
    suspend fun checkoutKaseraPay(billId:Long, ch:String): Result<KaseraCheckoutResponse> = checkout(billId,ch)
    suspend fun confirmPayment(id:Long): Result<Boolean> = confirm(id)
    suspend fun topUpUangSaku(a:Double): Result<UangSakuResponse> = topUp(a, "transfer_manual")
    suspend fun checkoutTopUpPaymentKu(a:Double,ch:String): Result<KaseraCheckoutResponse> = checkout(-1,ch)
}
