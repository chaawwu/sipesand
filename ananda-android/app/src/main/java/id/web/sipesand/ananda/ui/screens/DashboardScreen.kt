package id.web.sipesand.ananda.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import id.web.sipesand.ananda.AnandaApp
import id.web.sipesand.ananda.data.model.DashboardData
import id.web.sipesand.ananda.data.repository.AnandaRepository
import id.web.sipesand.ananda.ui.components.BottomNavBar
import id.web.sipesand.ananda.ui.components.CurvedHeader
import id.web.sipesand.ananda.ui.components.QuickAccessGrid
import id.web.sipesand.ananda.ui.theme.*
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

@Composable
fun DashboardScreen(
    onNavigate: (String) -> Unit
) {
    val repository = remember { AnandaRepository() }
    val scope = rememberCoroutineScope()
    var dashboardData by remember { mutableStateOf<DashboardData?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(key1 = true) {
        isLoading = true
        val res = repository.getDashboard()
        if (res.isSuccess) { dashboardData = res.getOrNull(); errorMsg = null }
        else { errorMsg = res.exceptionOrNull()?.message ?: "Gagal memuat data" }
        isLoading = false
    }

    val localeID = Locale("id", "ID")
    val currencyFormat = NumberFormat.getCurrencyInstance(localeID).apply { maximumFractionDigits = 0 }

    Scaffold(
        bottomBar = {
            BottomNavBar(
                currentRoute = "dashboard",
                onNavigate = { route -> onNavigate(route) },
                onCenterActionClick = { onNavigate("fees") }
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        when {
            isLoading -> Box(modifier = Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = SolidRoyalBlue)
            }
            errorMsg != null && dashboardData == null -> Box(modifier = Modifier.fillMaxSize().padding(paddingValues).padding(24.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(errorMsg ?: "Gagal memuat", fontFamily = InterFamily, color = TextSecondary, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(onClick = { scope.launch { isLoading = true; val r = repository.getDashboard(); dashboardData = r.getOrNull(); errorMsg = r.exceptionOrNull()?.message; isLoading = false } }, shape = RoundedCornerShape(24.dp), colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue)) {
                        Text("Coba Lagi", color = Color.White, fontFamily = InterFamily, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
            else -> {
                val data = dashboardData!!
                Column(
                    modifier = Modifier.fillMaxSize().padding(bottom = paddingValues.calculateBottomPadding()).verticalScroll(rememberScrollState())
                ) {
                    CurvedHeader(
                        waliName = AnandaApp.getWaliName(),
                        pesantrenName = data.pesantren.name,
                        santri = data.santri,
                        searchQuery = searchQuery,
                        onSearchChange = { searchQuery = it },
                        unreadNotifCount = data.unreadChatsCount,
                        onNotifClick = { onNavigate("notices") }
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    FinancialSummaryCard(
                        saldoSaku = data.keuangan.saldoUangSaku,
                        tagihanAktif = data.keuangan.totalTagihanAktif,
                        jumlahTagihan = data.keuangan.jumlahTagihanAktif,
                        currencyFormat = currencyFormat,
                        onPayClick = { onNavigate("fees") },
                        onTopUpClick = { onNavigate("fees") }
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    QuickAccessGrid(onItemClick = { route ->
                        when(route){
                            "uang_saku" -> onNavigate("fees")
                            "nilai" -> onNavigate("grades")
                            "absensi" -> onNavigate("attendance")
                            "profile" -> onNavigate("akademik")
                            else -> onNavigate(route)
                        }
                    })
                    Spacer(modifier = Modifier.height(20.dp))
                    data.akademik?.hafalanTerakhir?.let { hafalan ->
                        Surface(shape = RoundedCornerShape(24.dp), color = Color.White, shadowElevation = 1.dp, modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).clickable { onNavigate("tahfidz") }) {
                            Row(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                                Surface(shape = RoundedCornerShape(16.dp), color = Color(0xFFDEF7EC), modifier = Modifier.size(48.dp)) {
                                    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                                        Icon(imageVector = Icons.Default.MenuBook, contentDescription = "Tahfidz", tint = Color(0xFF059669), modifier = Modifier.size(24.dp))
                                    }
                                }
                                Spacer(modifier = Modifier.width(14.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(text = "Hafalan Terakhir", fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(color = Color(0xFFECFDF5), shape = RoundedCornerShape(6.dp)) {
                                            Text(text = hafalan.kualitas, color = Color(0xFF059669), fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = InterFamily, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                        }
                                    }
                                    Text(text = "${hafalan.surah} • ${hafalan.ayatRange}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = PoppinsFamily)
                                    Text(text = "Musyrif: ${hafalan.musyrifName ?: "-"}", fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily)
                                }
                                Icon(imageVector = Icons.Default.ChevronRight, contentDescription = "Buka", tint = TextMuted, modifier = Modifier.size(20.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                    if (data.pengumuman.isNotEmpty()) {
                        Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                            Text(text = "Pengumuman Pesantren", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = PoppinsFamily, modifier = Modifier.padding(bottom = 10.dp))
                            data.pengumuman.forEach { notice ->
                                Surface(shape = RoundedCornerShape(24.dp), color = Color.White, shadowElevation = 1.dp, modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp).clickable { onNavigate("notices") }) {
                                    Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                                        if (notice.imageUrl != null) {
                                            AsyncImage(model = notice.imageUrl, contentDescription = null, modifier = Modifier.size(52.dp).clip(RoundedCornerShape(12.dp)))
                                            Spacer(modifier = Modifier.width(12.dp))
                                        }
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(text = notice.title, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily, maxLines = 2)
                                            Text(text = notice.content, fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily, maxLines = 2, modifier = Modifier.padding(top = 2.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}

@Composable
fun FinancialSummaryCard(
    saldoSaku: Double,
    tagihanAktif: Double,
    jumlahTagihan: Int,
    currencyFormat: NumberFormat,
    onPayClick: () -> Unit,
    onTopUpClick: () -> Unit
) {
    Surface(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), shape = RoundedCornerShape(24.dp), color = Color.White, shadowElevation = 1.5.dp) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.AccountBalanceWallet, contentDescription = null, tint = Color(0xFF0F9D6A), modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Saldo Uang Saku", fontSize = 12.sp, color = TextSecondary, fontFamily = InterFamily)
                    }
                    Text(text = currencyFormat.format(saldoSaku), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary, fontFamily = PoppinsFamily)
                }
                OutlinedButton(onClick = onTopUpClick, shape = RoundedCornerShape(24.dp), contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp), colors = ButtonDefaults.outlinedButtonColors(contentColor = SolidRoyalBlue)) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Top Up", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, fontFamily = InterFamily)
                }
            }
            HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp), color = BorderSoft)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text(text = "Tagihan Belum Lunas ($jumlahTagihan item)", fontSize = 12.sp, color = TextSecondary, fontFamily = InterFamily)
                    Text(text = currencyFormat.format(tagihanAktif), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = if (tagihanAktif > 0) StatusUnpaidRed else StatusPaidGreen, fontFamily = PoppinsFamily)
                }
                Button(onClick = onPayClick, shape = RoundedCornerShape(24.dp), colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue), contentPadding = PaddingValues(horizontal = 18.dp, vertical = 10.dp)) {
                    Text("Bayar Sekarang", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White, fontFamily = InterFamily)
                }
            }
        }
    }
}
