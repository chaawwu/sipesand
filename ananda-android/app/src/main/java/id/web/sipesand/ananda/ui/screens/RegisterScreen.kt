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
                title = { Text("Pendaftaran Akun Wali", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White) },
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
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
        ) {
            Surface(
                color = PastelIndigo,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(text = "Lembaga Pesantren:", fontSize = 11.sp, color = TextSecondary)
                    Text(text = pesantrenName, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = RoyalBlueDark)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Formulir Wali Santri",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Admin pesantren akan memverifikasi kecocokan data Anda dengan berkas santri.",
                fontSize = 12.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
            )

            // Nama Lengkap Wali
            OutlinedTextField(
                value = namaWali,
                onValueChange = { namaWali = it },
                label = { Text("Nama Lengkap Wali Santri") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = RoyalBluePrimary) },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = RoyalBluePrimary, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // WhatsApp
            OutlinedTextField(
                value = noWa,
                onValueChange = { noWa = it },
                label = { Text("Nomor WhatsApp Aktif") },
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = RoyalBluePrimary) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = RoyalBluePrimary, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Hubungan (Ayah / Ibu / Wali)
            Text(text = "Hubungan dengan Santri:", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextPrimary)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Ayah", "Ibu", "Wali").forEach { rel ->
                    FilterChip(
                        selected = relationship == rel,
                        onClick = { relationship = rel },
                        label = { Text(rel) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = RoyalBluePrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Nama Ananda
            OutlinedTextField(
                value = namaAnanda,
                onValueChange = { namaAnanda = it },
                label = { Text("Nama Lengkap Ananda (Santri)") },
                leadingIcon = { Icon(Icons.Default.School, contentDescription = null, tint = RoyalBluePrimary) },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = RoyalBluePrimary, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // NIS Ananda
            OutlinedTextField(
                value = nisAnanda,
                onValueChange = { nisAnanda = it },
                label = { Text("Nomor Induk Santri / NIS (Bila sudah ada)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = RoyalBluePrimary, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Alamat Domisili
            OutlinedTextField(
                value = alamat,
                onValueChange = { alamat = it },
                label = { Text("Alamat Domisili Wali Santri") },
                shape = RoundedCornerShape(12.dp),
                minLines = 2,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = RoyalBluePrimary, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White)
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (errorMsg != null) {
                Text(
                    text = errorMsg!!,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 13.sp,
                    modifier = androidx.compose.ui.Modifier.padding(vertical = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    if (namaWali.isBlank() || noWa.isBlank() || namaAnanda.isBlank()) {
                        Toast.makeText(context, "Harap lengkapi semua kolom wajib", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    scope.launch {
                        isLoading = true
                        errorMsg = null
                        val result = repository.register(
                            pesantrenId = pesantrenId,
                            namaWali = namaWali,
                            noWa = noWa,
                            hubungan = relationship,
                            namaAnanda = namaAnanda,
                            nis = nisAnanda,
                            alamat = alamat
                        )
                        isLoading = false
                        if (result.isSuccess) {
                            Toast.makeText(context, "Pendaftaran berhasil! Akun sedang diverifikasi admin.", Toast.LENGTH_LONG).show()
                            onRegisterSuccess()
                        } else {
                            errorMsg = result.exceptionOrNull()?.message ?: "Pendaftaran gagal. Silakan coba lagi."
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
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text(
                        text = "Daftarkan Akun Wali",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
