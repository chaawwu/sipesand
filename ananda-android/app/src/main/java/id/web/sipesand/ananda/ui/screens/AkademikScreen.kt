package id.web.sipesand.ananda.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import id.web.sipesand.ananda.data.model.AbsensiItem
import id.web.sipesand.ananda.data.model.HafalanItem
import id.web.sipesand.ananda.data.model.NilaiItem
import id.web.sipesand.ananda.data.repository.AnandaRepository
import id.web.sipesand.ananda.ui.components.BottomNavBar
import id.web.sipesand.ananda.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AkademikScreen(
    initialTab: Int = 0, // 0: Rapor/Nilai, 1: Tahfidz, 2: Absensi
    onNavigate: (String) -> Unit
) {
    val repository = remember { AnandaRepository() }
    val scope = rememberCoroutineScope()

    var selectedTab by remember { mutableStateOf(initialTab) }
    var nilaiList by remember { mutableStateOf<List<NilaiItem>>(emptyList()) }
    var hafalanList by remember { mutableStateOf<List<HafalanItem>>(emptyList()) }
    var absensiList by remember { mutableStateOf<List<AbsensiItem>>(emptyList()) }
    var rataRata by remember { mutableStateOf(89.85) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(key1 = true) {
        scope.launch {
            isLoading = true
            val nRes = repository.getNilai()
            nilaiList = nRes.getOrNull()?.nilaiList ?: emptyList()
            rataRata = nRes.getOrNull()?.rataRata ?: 89.85

            val tRes = repository.getTahfidz()
            hafalanList = tRes.getOrNull()?.setoranList ?: emptyList()

            val aRes = repository.getAbsensi()
            absensiList = aRes.getOrNull()?.absensiList ?: emptyList()
            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Akademik & Perkembangan", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate("dashboard") }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = RoyalBlueDark)
            )
        },
        bottomBar = {
            BottomNavBar(
                currentRoute = "grades",
                onNavigate = { route -> onNavigate(route) },
                onCenterActionClick = { onNavigate("perizinan") }
            )
        },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = RoyalBluePrimary
            ) {
                Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("Rapor Nilai") })
                Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("Tahfidz Al-Qur'an") })
                Tab(selected = selectedTab == 2, onClick = { selectedTab = 2 }, text = { Text("Absensi Sholat") })
            }

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = RoyalBluePrimary)
                }
            } else {
                when (selectedTab) {
                    0 -> {
                        // Nilai / Rapor
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            item {
                                Surface(
                                    shape = RoundedCornerShape(16.dp),
                                    color = RoyalBlueDark,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(20.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text("Rata-Rata Nilai Semester", fontSize = 12.sp, color = Color(0xFF93C5FD))
                                            Text("$rataRata / 100", fontSize = 26.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                                            Text("Predikat: Mumtaz (Sangat Baik)", fontSize = 12.sp, color = Color.White.copy(alpha = 0.8f))
                                        }
                                        Icon(Icons.Default.WorkspacePremium, contentDescription = null, tint = Color(0xFFFBBF24), modifier = Modifier.size(54.dp))
                                    }
                                }
                            }

                            items(nilaiList) { item ->
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = Color.White,
                                    shadowElevation = 1.dp,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Surface(
                                            shape = RoundedCornerShape(10.dp),
                                            color = PastelRose,
                                            modifier = Modifier.size(46.dp)
                                        ) {
                                            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                                                Text(item.grade, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = PastelRoseIcon)
                                            }
                                        }
                                        Spacer(modifier = Modifier.width(14.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(item.subject, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                            Text("Pengajar: ${item.teacherName ?: "-"}", fontSize = 12.sp, color = TextSecondary)
                                            item.feedback?.let {
                                                Text(it, fontSize = 11.sp, color = TextMuted, modifier = Modifier.padding(top = 2.dp))
                                            }
                                        }
                                        Text(
                                            text = item.score.toString(),
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = RoyalBluePrimary
                                        )
                                    }
                                }
                            }
                        }
                    }
                    1 -> {
                        // Tahfidz & Muhafadzoh
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            item {
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = PastelEmerald,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.AutoStories, contentDescription = null, tint = PastelEmeraldIcon, modifier = Modifier.size(28.dp))
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Column {
                                            Text("Capaian Tahfidz Santri", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = RoyalBlueDark)
                                            Text("Halaqah Al-Qur'an & Kitab Kuning Harian", fontSize = 11.sp, color = TextSecondary)
                                        }
                                    }
                                }
                            }

                            items(hafalanList) { hafalan ->
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = Color.White,
                                    shadowElevation = 1.dp,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(14.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(hafalan.surah, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                            Surface(color = PastelMint, shape = RoundedCornerShape(6.dp)) {
                                                Text(hafalan.kualitas, color = PastelMintIcon, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp))
                                            }
                                        }
                                        Text(
                                            text = "${hafalan.ayatRange} • ${hafalan.juz}",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = RoyalBluePrimary,
                                            modifier = Modifier.padding(top = 4.dp)
                                        )
                                        Text("Penguji: ${hafalan.musyrifName ?: "-"}", fontSize = 12.sp, color = TextSecondary, modifier = Modifier.padding(top = 2.dp))
                                        hafalan.notes?.let {
                                            Text("Catatan: $it", fontSize = 11.sp, color = TextMuted, modifier = Modifier.padding(top = 4.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                    2 -> {
                        // Absensi
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(absensiList) { abs ->
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = Color.White,
                                    shadowElevation = 1.dp,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(14.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Surface(
                                            shape = RoundedCornerShape(10.dp),
                                            color = PastelSky,
                                            modifier = Modifier.size(42.dp)
                                        ) {
                                            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                                                Icon(Icons.Default.AccessTime, contentDescription = null, tint = PastelSkyIcon)
                                            }
                                        }
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(abs.activity, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                            Text("${abs.date} • ${abs.notes ?: "Tepat waktu"}", fontSize = 11.sp, color = TextSecondary)
                                        }
                                        Surface(color = PastelMint, shape = RoundedCornerShape(6.dp)) {
                                            Text(abs.status, color = PastelMintIcon, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp))
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
