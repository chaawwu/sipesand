package id.web.sipesand.ananda.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
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

    LaunchedEffect(key1 = true) {
        scope.launch {
            isLoading = true
            val res = repository.getDashboard()
            dashboardData = res.getOrNull()
            isLoading = false
        }
    }

    val localeID = Locale("id", "ID")
    val currencyFormat = NumberFormat.getCurrencyInstance(localeID).apply {
        maximumFractionDigits = 0
    }

    Scaffold(
        bottomBar = {
            BottomNavBar(
                currentRoute = "dashboard",
                onNavigate = { route -> onNavigate(route) },
                onCenterActionClick = { onNavigate("perizinan") }
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        if (isLoading && dashboardData == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = RoyalBluePrimary)
            }
        } else {
            val data = dashboardData
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = paddingValues.calculateBottomPadding())
                    .verticalScroll(rememberScrollState())
            ) {
                // 1. Signature Curved Royal Blue Header
                CurvedHeader(
                    waliName = AnandaApp.getWaliName(),
                    pesantrenName = data?.pesantren?.name ?: "Pondok Pesantren Darul Rahman",
                    santri = data?.santri,
                    searchQuery = searchQuery,
                    onSearchChange = { searchQuery = it },
                    unreadNotifCount = data?.unreadChatsCount ?: 1,
                    onNotifClick = { onNavigate("notices") }
                )

                Spacer(modifier = Modifier.height(14.dp))

                // 2. Financial Balance & Active Bill Card
                FinancialSummaryCard(
                    saldoSaku = data?.keuangan?.saldoUangSaku ?: 385000.0,
                    tagihanAktif = data?.keuangan?.totalTagihanAktif ?: 452500.0,
                    jumlahTagihan = data?.keuangan?.jumlahTagihanAktif ?: 1,
                    currencyFormat = currencyFormat,
                    onPayClick = { onNavigate("fees") },
                    onTopUpClick = { onNavigate("fees") }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // 3. Quick Access Grid (12 Items from Reference Image 2)
                QuickAccessGrid(
                    onItemClick = { route -> onNavigate(route) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // 4. Academic & Tahfidz Preview Card
                data?.akademik?.hafalanTerakhir?.let { hafalan ->
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color.White,
                        shadowElevation = 2.dp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .clickable { onNavigate("tahfidz") }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = PastelEmerald,
                                modifier = Modifier.size(48.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                                    Icon(
                                        imageVector = Icons.Default.MenuBook,
                                        contentDescription = "Tahfidz",
                                        tint = PastelEmeraldIcon,
                                        modifier = Modifier.size(26.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "Hafalan Terakhir",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Surface(
                                        color = PastelMint,
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            text = hafalan.kualitas,
                                            color = PastelMintIcon,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Text(
                                    text = "${hafalan.surah} • ${hafalan.ayatRange}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Musyrif: ${hafalan.musyrifName ?: "Ust. Dr. Abdul Halim"}",
                                    fontSize = 11.sp,
                                    color = TextSecondary
                                )
                            }

                            Icon(
                                imageVector = Icons.Default.ChevronRight,
                                contentDescription = "Buka",
                                tint = TextMuted
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 5. Pesantren Announcements
                if (!data?.pengumuman.isNullOrEmpty()) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                    ) {
                        Text(
                            text = "Pengumuman & Berita Pesantren",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            modifier = Modifier.padding(bottom = 10.dp)
                        )

                        data?.pengumuman?.forEach { notice ->
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = Color.White,
                                shadowElevation = 1.dp,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 10.dp)
                                    .clickable { onNavigate("notices") }
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    if (notice.imageUrl != null) {
                                        AsyncImage(
                                            model = notice.imageUrl,
                                            contentDescription = null,
                                            modifier = Modifier
                                                .size(54.dp)
                                                .clip(RoundedCornerShape(8.dp))
                                        )
                                        Spacer(modifier = Modifier.width(12.dp))
                                    }
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = notice.title,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary,
                                            maxLines = 2
                                        )
                                        Text(
                                            text = notice.content,
                                            fontSize = 11.sp,
                                            color = TextSecondary,
                                            maxLines = 2,
                                            modifier = Modifier.padding(top = 2.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
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
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(18.dp),
        color = Color.White,
        shadowElevation = 3.dp
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Saldo Uang Saku
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AccountBalanceWallet,
                            contentDescription = null,
                            tint = StatusPaidGreen,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Saldo Uang Saku",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                    Text(
                        text = currencyFormat.format(saldoSaku),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = RoyalBlueDark
                    )
                }

                // Top Up Button
                OutlinedButton(
                    onClick = onTopUpClick,
                    shape = RoundedCornerShape(20.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = RoyalBluePrimary)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Top Up", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            Divider(modifier = Modifier.padding(vertical = 12.dp), color = BorderColor)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Tagihan Belum Lunas ($jumlahTagihan item)",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                    Text(
                        text = currencyFormat.format(tagihanAktif),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (tagihanAktif > 0) StatusUnpaidRed else StatusPaidGreen
                    )
                }

                Button(
                    onClick = onPayClick,
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text("Bayar Sekarang", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        }
    }
}
