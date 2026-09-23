package id.web.sipesand.ananda.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Mosque
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import id.web.sipesand.ananda.data.model.PesantrenItem
import id.web.sipesand.ananda.data.repository.AnandaRepository
import id.web.sipesand.ananda.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PesantrenSelectScreen(
    onPesantrenSelected: (Long, String) -> Unit
) {
    val repository = remember { AnandaRepository() }
    val scope = rememberCoroutineScope()
    var pesantrens by remember { mutableStateOf<List<PesantrenItem>>(emptyList()) }
    var searchQuery by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }

    var errorMsg by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(key1 = true) {
        isLoading = true
        val res = repository.getPesantrens(null)
        if (res.isSuccess) { pesantrens = res.getOrNull()!!; errorMsg = null }
        else { errorMsg = res.exceptionOrNull()?.message; pesantrens = emptyList() }
        isLoading = false
    }

    val filteredList = pesantrens.filter {
        it.name.contains(searchQuery, ignoreCase = true) ||
        it.address?.contains(searchQuery, ignoreCase = true) == true
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = "Pilih Pondok Pesantren", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color.White, fontFamily = PoppinsFamily) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SolidRoyalBlue)
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
            Text(text = "Selamat Datang di Portal Wali", fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = PoppinsFamily)
            Text(text = "Pilih lembaga tempat ananda menuntut ilmu. Data sinkron langsung dengan database pesantren/tenant.", fontSize = 12.sp, color = TextSecondary, fontFamily = InterFamily, modifier = Modifier.padding(top = 4.dp, bottom = 16.dp))

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Cari nama pesantren atau kota...", fontSize = 13.sp, fontFamily = InterFamily) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Cari", tint = TextSecondary) },
                shape = RoundedCornerShape(24.dp),
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = SolidRoyalBlue, unfocusedBorderColor = BorderColor, focusedContainerColor = Color.White, unfocusedContainerColor = Color.White),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            )

            when {
                isLoading -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = SolidRoyalBlue) }
                errorMsg != null -> Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(errorMsg ?: "Gagal memuat pesantren", color = TextSecondary, fontFamily = InterFamily, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = { scope.launch { isLoading = true; val r = repository.getPesantrens(null); if (r.isSuccess) pesantrens = r.getOrNull()!!; errorMsg = r.exceptionOrNull()?.message; isLoading = false } }, shape = RoundedCornerShape(24.dp), colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue)) { Text("Coba Lagi", color = Color.White, fontFamily = InterFamily) }
                    }
                }
                filteredList.isEmpty() -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Tidak ada pesantren ditemukan", color = TextMuted, fontFamily = InterFamily) }
                else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxSize()) {
                    items(filteredList) { pesantren ->
                        PesantrenCard(pesantren = pesantren, onClick = {
                            // Simpan tenant ke prefs untuk header X-Tenant
                            id.web.sipesand.ananda.AnandaApp.savePesantrenSelection(pesantren.id, pesantren.name, pesantren.code, pesantren.slug)
                            onPesantrenSelected(pesantren.id, pesantren.name)
                        })
                    }
                }
            }
        }
    }
}

@Composable
fun PesantrenCard(
    pesantren: PesantrenItem,
    onClick: () -> Unit
) {
    Surface(shape = RoundedCornerShape(24.dp), color = Color.White, shadowElevation = 1.5.dp, modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(shape = RoundedCornerShape(16.dp), color = Color(0xFFEFF6FF), modifier = Modifier.size(52.dp)) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                    if (pesantren.logoUrl != null) {
                        AsyncImage(model = pesantren.logoUrl, contentDescription = pesantren.name, modifier = Modifier.size(36.dp))
                    } else {
                        Icon(imageVector = Icons.Default.Mosque, contentDescription = pesantren.name, tint = SolidRoyalBlue, modifier = Modifier.size(28.dp))
                    }
                }
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = pesantren.name, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily)
                Text(text = pesantren.address ?: pesantren.code, fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily, maxLines = 1)
                Text(text = "Sinkron DB Tenant", fontSize = 10.sp, color = Color(0xFF0F9D6A), fontWeight = FontWeight.Medium, fontFamily = InterFamily, modifier = Modifier.padding(top = 2.dp))
            }
            Icon(imageVector = Icons.Default.ChevronRight, contentDescription = "Pilih", tint = TextMuted, modifier = Modifier.size(18.dp))
        }
    }
}
