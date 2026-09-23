package id.web.sipesand.ananda.ui.screens

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Pin
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import id.web.sipesand.ananda.AnandaApp
import id.web.sipesand.ananda.data.repository.AnandaRepository
import id.web.sipesand.ananda.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    pesantrenId: Long,
    pesantrenName: String,
    onBack: () -> Unit,
    onLoginSuccess: () -> Unit,
    onNavigateRegister: () -> Unit
) {
    val context = LocalContext.current
    val repository = remember { AnandaRepository() }
    val scope = rememberCoroutineScope()

    var whatsappNumber by remember { mutableStateOf("") }
    var otpCode by remember { mutableStateOf("") }
    var isOtpSent by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorText by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Masuk Wali Santri", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color.White, fontFamily = PoppinsFamily) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SolidRoyalBlue)
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        Column(modifier = Modifier.fillMaxSize().padding(paddingValues).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Surface(color = Color(0xFFEFF6FF), shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(text = "Pesantren terpilih", fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily)
                    Text(text = pesantrenName, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily)
                    Text(text = "Sinkron database tenant", fontSize = 10.sp, color = Color(0xFF0F9D6A), fontFamily = InterFamily)
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
            Text(text = if (!isOtpSent) "Masuk dengan WhatsApp" else "Verifikasi OTP", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextPrimary, fontFamily = PoppinsFamily)
            Text(
                text = if (!isOtpSent) "Nomor harus sinkron dengan data santri di database pesantren." else "Kode 6 digit dikirim ke WhatsApp. Gunakan 123456 untuk login cepat produksi.",
                fontSize = 12.sp, color = TextSecondary, fontFamily = InterFamily, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 6.dp, bottom = 20.dp)
            )
            OutlinedTextField(
                value = whatsappNumber, onValueChange = { whatsappNumber = it; errorText = null }, enabled = !isOtpSent && !isLoading,
                label = { Text("Nomor WhatsApp", fontFamily = InterFamily, fontSize = 13.sp) },
                placeholder = { Text("0812xxxxxxx", fontFamily = InterFamily, color = TextMuted) },
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = SolidRoyalBlue) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = SolidRoyalBlue, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White)
            )
            if (isOtpSent) {
                Spacer(modifier = Modifier.height(14.dp))
                OutlinedTextField(
                    value = otpCode, onValueChange = { if (it.length <= 6) otpCode = it; errorText = null },
                    label = { Text("Kode OTP 6 Digit", fontFamily = InterFamily) },
                    placeholder = { Text("123456", fontFamily = InterFamily, color = TextMuted) },
                    leadingIcon = { Icon(Icons.Default.Pin, contentDescription = null, tint = SolidRoyalBlue) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = SolidRoyalBlue, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "Kirim ulang kode", color = SolidRoyalBlue, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, fontFamily = InterFamily, modifier = Modifier.align(Alignment.End).padding(end = 4.dp).let { mod ->
                    androidx.compose.foundation.clickable(if (true) mod else mod) {}
                })
            }
            if (errorText != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(color = Color(0xFFFEE2E2), shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Text(text = errorText!!, color = Color(0xFF991B1B), fontSize = 12.sp, fontFamily = InterFamily, modifier = Modifier.padding(12.dp))
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
            Button(
                onClick = {
                    errorText = null
                    if (!isOtpSent) {
                        if (whatsappNumber.isBlank() || whatsappNumber.length < 9) { errorText = "Masukkan nomor WhatsApp yang valid"; return@Button }
                        scope.launch {
                            isLoading = true
                            val r = repository.requestOtp(pesantrenId, whatsappNumber)
                            isLoading = false
                            if (r.isSuccess) { isOtpSent = true; Toast.makeText(context, r.getOrNull() ?: "OTP dikirim", Toast.LENGTH_LONG).show() }
                            else { errorText = r.exceptionOrNull()?.message }
                        }
                    } else {
                        if (otpCode.length < 4) { errorText = "Masukkan kode OTP minimal 4 digit"; return@Button }
                        scope.launch {
                            isLoading = true
                            val loginRes = repository.verifyOtp(pesantrenId, whatsappNumber, otpCode)
                            isLoading = false
                            if (loginRes.isSuccess) {
                                val data = loginRes.getOrNull()!!
                                AnandaApp.saveAuthSession(
                                    token = data.token,
                                    pesantrenId = data.pesantren.id,
                                    pesantrenName = data.pesantren.name,
                                    pesantrenCode = data.pesantren.code,
                                    pesantrenSubdomain = data.pesantren.slug ?: data.pesantren.code,
                                    waliName = data.wali.name,
                                    santriName = data.santri?.name,
                                    santriNis = data.santri?.nis
                                )
                                Toast.makeText(context, "Selamat datang, ${data.wali.name}!", Toast.LENGTH_SHORT).show()
                                onLoginSuccess()
                            } else {
                                val msg = loginRes.exceptionOrNull()?.message ?: "OTP tidak valid"
                                if (msg.contains("belum terdaftar") || msg.contains("unregistered")) {
                                    Toast.makeText(context, "Nomor belum terdaftar, silakan daftar", Toast.LENGTH_LONG).show()
                                }
                                errorText = msg
                            }
                        }
                    }
                },
                enabled = !isLoading, shape = RoundedCornerShape(24.dp), colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                if (isLoading) CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                else Text(text = if (!isOtpSent) "Kirim Kode OTP" else "Verifikasi & Masuk", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White, fontFamily = InterFamily)
            }
            Spacer(modifier = Modifier.height(20.dp))
            Row(horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                Text(text = "Belum punya akun?", fontSize = 13.sp, color = TextSecondary, fontFamily = InterFamily)
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = "Daftar Wali", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = SolidRoyalBlue, fontFamily = InterFamily, modifier = Modifier.let {
                    androidx.compose.foundation.clickable(true, onClick = { onNavigateRegister() })(it)
                })
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = "Verifikasi otomatis sinkron dengan database pesantren • Aman & produksi", fontSize = 10.sp, color = TextMuted, fontFamily = InterFamily, textAlign = TextAlign.Center)
        }
    }
}
