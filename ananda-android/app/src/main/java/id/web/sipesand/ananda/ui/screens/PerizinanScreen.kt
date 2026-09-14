package id.web.sipesand.ananda.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import id.web.sipesand.ananda.AnandaApp
import id.web.sipesand.ananda.data.model.PerizinanItem
import id.web.sipesand.ananda.data.repository.AnandaRepository
import id.web.sipesand.ananda.ui.components.BottomNavBar
import id.web.sipesand.ananda.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PerizinanScreen(
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val repository = remember { AnandaRepository() }
    val scope = rememberCoroutineScope()

    var permits by remember { mutableStateOf<List<PerizinanItem>>(emptyList()) }
    var showFormDialog by remember { mutableStateOf(false) }
    var reason by remember { mutableStateOf("") }
    var startDate by remember { mutableStateOf("2026-09-16 09:00") }
    var endDate by remember { mutableStateOf("2026-09-19 17:00") }
    var description by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(key1 = true) {
        scope.launch {
            isLoading = true
            val res = repository.getPerizinans()
            permits = res.getOrNull() ?: emptyList()
            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Perizinan Pulang Santri", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate("dashboard") }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = RoyalBlueDark)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showFormDialog = true },
                containerColor = RoyalBluePrimary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Ajukan Izin")
            }
        },
        bottomBar = {
            BottomNavBar(
                currentRoute = "perizinan",
                onNavigate = { route -> onNavigate(route) },
                onCenterActionClick = { showFormDialog = true }
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text(
                text = "Izin Pulang & Barcode Satpam",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Tunjukkan barcode izin ini kepada petugas pos keamanan saat menjemput santri.",
                fontSize = 12.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
            )

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = RoyalBluePrimary)
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(permits) { permit ->
                        val isApproved = permit.status.equals("approved", ignoreCase = true)

                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color.White,
                            shadowElevation = 2.dp,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        color = if (isApproved) PastelMint else PastelAmber,
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = if (isApproved) "DISETUJUI" else "MENUNGGU VERIFIKASI",
                                            color = if (isApproved) PastelMintIcon else PastelAmberIcon,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                        )
                                    }

                                    Text(
                                        text = permit.startDate,
                                        fontSize = 11.sp,
                                        color = TextMuted
                                    )
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = permit.reason,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Periode: ${permit.startDate} s/d ${permit.endDate}",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                                permit.approvedBy?.let {
                                    Text(
                                        text = "Disetujui oleh: $it",
                                        fontSize = 11.sp,
                                        color = RoyalBluePrimary,
                                        fontWeight = FontWeight.Medium,
                                        modifier = Modifier.padding(top = 2.dp)
                                    )
                                }

                                if (isApproved && permit.qrCodeToken != null) {
                                    Spacer(modifier = Modifier.height(14.dp))
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = PastelSky,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.QrCode,
                                                contentDescription = "QR Code",
                                                tint = PastelSkyIcon,
                                                modifier = Modifier.size(54.dp)
                                            )
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Column {
                                                Text("TOKEN VERIFIKASI GERBANG", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = PastelSkyIcon)
                                                Text(permit.qrCodeToken, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = RoyalBlueDark)
                                                Text("Scan barcode di pos keamanan satpam", fontSize = 11.sp, color = TextSecondary)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Form Dialog Ajukan Izin Baru
    if (showFormDialog) {
        AlertDialog(
            onDismissRequest = { showFormDialog = false },
            title = { Text("Pengajuan Izin Pulang Santri", fontWeight = FontWeight.Bold, color = RoyalBlueDark) },
            text = {
                Column {
                    OutlinedTextField(
                        value = reason,
                        onValueChange = { reason = it },
                        label = { Text("Alasan Izin Pulang") },
                        placeholder = { Text("Contoh: Acara Keluarga / Berobat") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = startDate,
                        onValueChange = { startDate = it },
                        label = { Text("Tanggal & Jam Penjemputan") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = endDate,
                        onValueChange = { endDate = it },
                        label = { Text("Tanggal & Jam Kembali ke Asrama") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Keterangan Tambahan") },
                        minLines = 2,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (reason.isBlank()) {
                            Toast.makeText(context, "Masukkan alasan izin", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        val newPermit = PerizinanItem(
                            id = System.currentTimeMillis(),
                            reason = reason,
                            description = description,
                            startDate = startDate,
                            endDate = endDate,
                            status = "pending",
                            approvedBy = null,
                            qrCodeToken = "QR-PENDING-" + System.currentTimeMillis().toString().takeLast(4),
                            attachmentUrl = null
                        )
                        permits = listOf(newPermit) + permits
                        Toast.makeText(context, "Permohonan izin diajukan ke pengurus!", Toast.LENGTH_SHORT).show()
                        showFormDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                ) {
                    Text("Kirim Permohonan", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showFormDialog = false }) { Text("Batal", color = TextSecondary) }
            }
        )
    }
}
