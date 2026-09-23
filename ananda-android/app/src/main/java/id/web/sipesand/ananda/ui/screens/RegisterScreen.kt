package id.web.sipesand.ananda.ui.screens

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import id.web.sipesand.ananda.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    pesantrenId: Long = 1L,
    pesantrenName: String,
    onBack: () -> Unit,
    onRegisterSuccess: () -> Unit
) {
    val context = LocalContext.current
    val repository = remember { id.web.sipesand.ananda.data.repository.AnandaRepository() }
    val scope = rememberCoroutineScope()
    var namaWali by remember { mutableStateOf("") }
    var noWa by remember { mutableStateOf("") }
    var relationship by remember { mutableStateOf("Ayah") }
    var alamat by remember { mutableStateOf("") }
    var namaAnanda by remember { mutableStateOf("") }
    var nisAnanda by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pendaftaran Wali Santri", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color.White, fontFamily = PoppinsFamily) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SolidRoyalBlue)
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        Column(modifier = Modifier.fillMaxSize().padding(paddingValues).verticalScroll(rememberScrollState()).padding(20.dp)) {
            Surface(color = Color(0xFFEFF6FF), shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(text = "Pesantren", fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily)
                    Text(text = pesantrenName, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily)
                    Text(text = "Data akan disinkronkan otomatis dengan database santri pesantren", fontSize = 10.sp, color = Color(0xFF0F9D6A), fontFamily = InterFamily)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = "Formulir Pendaftaran", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = PoppinsFamily)
            Text(text = "Masukkan NIS/nama ananda sesuai data pesantren. Verifikasi otomatis, tidak perlu tunggu admin.", fontSize = 12.sp, color = TextSecondary, fontFamily = InterFamily, modifier = Modifier.padding(top = 4.dp, bottom = 16.dp))
            OutlinedTextField(value = namaWali, onValueChange = { namaWali = it }, label = { Text("Nama Lengkap Wali", fontFamily = InterFamily, fontSize = 13.sp) }, leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = SolidRoyalBlue) }, shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth(), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = SolidRoyalBlue, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White))
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(value = noWa, onValueChange = { noWa = it }, label = { Text("WhatsApp Aktif", fontFamily = InterFamily) }, leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = SolidRoyalBlue) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth(), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = SolidRoyalBlue, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White))
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = "Hubungan", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextPrimary, fontFamily = InterFamily)
            Row(modifier = Modifier.fillMaxWidth().padding(top = 6.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Ayah", "Ibu", "Wali").forEach { rel ->
                    FilterChip(selected = relationship == rel, onClick = { relationship = rel }, label = { Text(rel, fontFamily = InterFamily) }, shape = RoundedCornerShape(24.dp), colors = FilterChipDefaults.filterChipColors(selectedContainerColor = SolidRoyalBlue, selectedLabelColor = Color.White))
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(value = namaAnanda, onValueChange = { namaAnanda = it }, label = { Text("Nama Lengkap Ananda", fontFamily = InterFamily) }, leadingIcon = { Icon(Icons.Default.School, contentDescription = null, tint = SolidRoyalBlue) }, shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth(), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = SolidRoyalBlue, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White))
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(value = nisAnanda, onValueChange = { nisAnanda = it }, label = { Text("NIS (wajib sinkron DB pesantren)", fontFamily = InterFamily, fontSize = 12.sp) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text), shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth(), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = SolidRoyalBlue, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White), placeholder = { Text("Contoh: 202409001", fontFamily = InterFamily, color = TextMuted)} )
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(value = alamat, onValueChange = { alamat = it }, label = { Text("Alamat Domisili", fontFamily = InterFamily) }, shape = RoundedCornerShape(24.dp), minLines = 2, modifier = Modifier.fillMaxWidth(), colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = SolidRoyalBlue, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White))
            Spacer(modifier = Modifier.height(8.dp))
            if (errorMsg != null) {
                Surface(color = Color(0xFFFEE2E2), shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Text(text = errorMsg!!, color = Color(0xFF991B1B), fontSize = 12.sp, fontFamily = InterFamily, modifier = Modifier.padding(12.dp))
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = {
                    if (namaWali.isBlank() || noWa.isBlank() || namaAnanda.isBlank()) { Toast.makeText(context, "Lengkapi nama wali, WA, dan nama ananda", Toast.LENGTH_SHORT).show(); return@Button }
                    scope.launch {
                        isLoading = true; errorMsg = null
                        val result = repository.register(pesantrenId = pesantrenId, namaWali = namaWali, noWa = noWa, hubungan = relationship, namaAnanda = namaAnanda, nis = nisAnanda, alamat = alamat)
                        isLoading = false
                        if (result.isSuccess) {
                            Toast.makeText(context, result.getOrNull() ?: "Pendaftaran berhasil sinkron!", Toast.LENGTH_LONG).show()
                            onRegisterSuccess()
                        } else errorMsg = result.exceptionOrNull()?.message ?: "Pendaftaran gagal"
                    }
                },
                enabled = !isLoading, shape = RoundedCornerShape(24.dp), colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue), modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                if (isLoading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                else Text(text = "Daftar & Verifikasi Otomatis", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.White, fontFamily = InterFamily)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = "NIS harus sesuai database pesantren/tenant. Sistem otomatis mencocokkan dan memverifikasi tanpa tunggu admin.", fontSize = 10.sp, color = TextMuted, fontFamily = InterFamily)
        }
    }
}
