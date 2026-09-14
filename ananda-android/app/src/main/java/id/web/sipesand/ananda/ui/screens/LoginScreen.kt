package id.web.sipesand.ananda.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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

    var whatsappNumber by remember { mutableStateOf("081234567890") }
    var otpCode by remember { mutableStateOf("") }
    var isOtpSent by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Login Wali Santri", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = RoyalBlueDark)
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                color = PastelIndigo,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Lembaga Terpilih:",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                    Text(
                        text = pesantrenName,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = RoyalBlueDark
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = if (!isOtpSent) "Masuk dengan WhatsApp" else "Verifikasi Kode OTP",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = if (!isOtpSent) 
                    "Masukkan nomor WhatsApp yang telah terdaftar di data santri pesantren." 
                else 
                    "Masukkan 6 digit kode OTP yang dikirimkan ke WhatsApp Anda (Gunakan: 123456).",
                fontSize = 13.sp,
                color = TextSecondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 6.dp, bottom = 24.dp)
            )

            // Input Nomor WhatsApp
            OutlinedTextField(
                value = whatsappNumber,
                onValueChange = { whatsappNumber = it },
                enabled = !isOtpSent && !isLoading,
                label = { Text("Nomor WhatsApp (Contoh: 081234567890)") },
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = RoyalBluePrimary) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = RoyalBluePrimary,
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            if (isOtpSent) {
                Spacer(modifier = Modifier.height(16.dp))

                // Input OTP
                OutlinedTextField(
                    value = otpCode,
                    onValueChange = { if (it.length <= 6) otpCode = it },
                    label = { Text("Kode OTP WhatsApp (6 Digit)") },
                    leadingIcon = { Icon(Icons.Default.Pin, contentDescription = null, tint = RoyalBluePrimary) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = RoyalBluePrimary,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Kirim Ulang Kode OTP",
                    color = RoyalBluePrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier
                        .align(Alignment.End)
                        .clickable {
                            scope.launch {
                                repository.requestOtp(pesantrenId, whatsappNumber)
                                Toast.makeText(context, "OTP dikirim ulang (123456)", Toast.LENGTH_SHORT).show()
                            }
                        }
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Main Action Button
            Button(
                onClick = {
                    if (!isOtpSent) {
                        if (whatsappNumber.isBlank()) {
                            Toast.makeText(context, "Masukkan nomor WhatsApp", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        scope.launch {
                            isLoading = true
                            val res = repository.requestOtp(pesantrenId, whatsappNumber)
                            isLoading = false
                            isOtpSent = true
                            Toast.makeText(context, res.getOrNull() ?: "Kode OTP: 123456", Toast.LENGTH_LONG).show()
                        }
                    } else {
                        if (otpCode.isBlank()) {
                            Toast.makeText(context, "Masukkan kode OTP", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        scope.launch {
                            isLoading = true
                            val loginRes = repository.verifyOtp(pesantrenId, whatsappNumber, otpCode)
                            isLoading = false
                            if (loginRes.isSuccess) {
                                val data = loginRes.getOrNull()
                                if (data != null) {
                                    AnandaApp.saveAuthSession(
                                        token = data.token,
                                        pesantrenId = data.pesantren.id,
                                        pesantrenName = data.pesantren.name,
                                        waliName = data.wali.name,
                                        santriName = data.santri?.name,
                                        santriNis = data.santri?.nis
                                    )
                                }
                                Toast.makeText(context, "Selamat datang di Ananda SiPesand!", Toast.LENGTH_SHORT).show()
                                onLoginSuccess()
                            } else {
                                Toast.makeText(context, "OTP tidak valid", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                },
                enabled = !isLoading,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                } else {
                    Text(
                        text = if (!isOtpSent) "Kirim Kode OTP WhatsApp" else "Verifikasi & Masuk",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Register Link
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Belum memiliki akun wali?",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Daftar Sekarang",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = RoyalBluePrimary,
                    modifier = Modifier.clickable(onClick = onNavigateRegister)
                )
            }
        }
    }
}
