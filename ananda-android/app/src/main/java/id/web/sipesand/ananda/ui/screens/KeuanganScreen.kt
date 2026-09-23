package id.web.sipesand.ananda.ui.screens

import android.widget.Toast
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
import id.web.sipesand.ananda.data.model.KaseraCheckoutResponse
import id.web.sipesand.ananda.data.model.TagihanItem
import id.web.sipesand.ananda.data.model.UangSakuItem
import id.web.sipesand.ananda.data.repository.AnandaRepository
import id.web.sipesand.ananda.ui.components.BottomNavBar
import id.web.sipesand.ananda.ui.theme.*
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KeuanganScreen(
    onNavigate: (String) -> Unit,
    onOpenKwitansi: (String) -> Unit
) {
    val context = LocalContext.current
    val repository = remember { AnandaRepository() }
    val scope = rememberCoroutineScope()

    var selectedTab by remember { mutableStateOf(0) }
    var bills by remember { mutableStateOf<List<TagihanItem>>(emptyList()) }
    var sakuHistory by remember { mutableStateOf<List<UangSakuItem>>(emptyList()) }
    var saldoSaku by remember { mutableStateOf(0.0) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    var activeCheckout by remember { mutableStateOf<KaseraCheckoutResponse?>(null) }
    var showTopUpDialog by remember { mutableStateOf(false) }

    val localeID = Locale("id", "ID")
    val currencyFormat = NumberFormat.getCurrencyInstance(localeID).apply { maximumFractionDigits = 0 }

    fun refresh() {
        scope.launch {
            isLoading = true; errorMsg = null
            val billsRes = repository.getTagihan()
            if (billsRes.isSuccess) {
                bills = billsRes.getOrNull()?.bills ?: emptyList()
                saldoSaku = billsRes.getOrNull()?.saldoSaku ?: 0.0
            } else errorMsg = billsRes.exceptionOrNull()?.message
            val sakuRes = repository.getUangSaku()
            if (sakuRes.isSuccess) {
                sakuHistory = sakuRes.getOrNull()?.history ?: emptyList()
                // saldo dari uang saku lebih akurat
                sakuRes.getOrNull()?.let { saldoSaku = it.saldo }
            }
            isLoading = false
        }
    }

    LaunchedEffect(key1 = true) { refresh() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Keuangan & Pembayaran", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color.White, fontFamily = PoppinsFamily) },
                navigationIcon = { IconButton(onClick = { onNavigate("dashboard") }) { Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White) } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SolidRoyalBlue)
            )
        },
        bottomBar = { BottomNavBar(currentRoute = "fees", onNavigate = { route -> onNavigate(route) }, onCenterActionClick = { onNavigate("perizinan") }) },
        containerColor = SurfaceBackground
    ) { paddingValues ->
        Column(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            TabRow(selectedTabIndex = selectedTab, containerColor = Color.White, contentColor = SolidRoyalBlue,
                indicator = { tabPositions -> if (tabPositions.isNotEmpty()) TabRowDefaults.SecondaryIndicator(modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]), color = SolidRoyalBlue) }) {
                Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("Tagihan", fontWeight = FontWeight.SemiBold, fontFamily = InterFamily, fontSize = 13.sp) })
                Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("Uang Saku", fontWeight = FontWeight.SemiBold, fontFamily = InterFamily, fontSize = 13.sp) })
            }
            when {
                isLoading -> Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = SolidRoyalBlue) }
                errorMsg != null && bills.isEmpty() && sakuHistory.isEmpty() -> Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(errorMsg ?: "Gagal memuat", color = TextSecondary, fontFamily = InterFamily, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = { refresh() }, shape = RoundedCornerShape(24.dp), colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue)) { Text("Muat Ulang", color = Color.White) }
                    }
                }
                selectedTab == 0 -> LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    item {
                        Surface(color = Color(0xFFEFF6FF), shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth()) {
                            Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = SolidRoyalBlue, modifier = Modifier.size(22.dp))
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(text = "Bayar via PaymentKu (paymentku.com) QRIS/VA otomatis ke rekening pesantren. Kwitansi resmi terbit otomatis.", fontSize = 12.sp, color = TextPrimary, fontFamily = InterFamily, lineHeight = 16.sp)
                            }
                        }
                    }
                    if (bills.isEmpty()) {
                        item { Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) { Text("Tidak ada tagihan aktif", color = TextMuted, fontFamily = InterFamily) } }
                    }
                    items(bills) { bill ->
                        BillItemCard(
                            bill = bill, currencyFormat = currencyFormat,
                            onPay = {
                                scope.launch {
                                    val ch = repository.checkoutPaymentKu(bill.id, "qris")
                                    if (ch.isSuccess) activeCheckout = ch.getOrNull()
                                    else Toast.makeText(context, ch.exceptionOrNull()?.message ?: "Gagal checkout", Toast.LENGTH_LONG).show()
                                }
                            },
                            onShowKwitansi = { bill.kwitansi?.receiptNo?.let { onOpenKwitansi(it) } ?: Toast.makeText(context, "Kwitansi belum tersedia", Toast.LENGTH_SHORT).show() }
                        )
                    }
                }
                else -> LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    item {
                        Surface(shape = RoundedCornerShape(24.dp), color = Color.White, shadowElevation = 1.5.dp, modifier = Modifier.fillMaxWidth()) {
                            Row(modifier = Modifier.padding(18.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Column {
                                    Text("Saldo Uang Saku", fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily)
                                    Text(currencyFormat.format(saldoSaku), fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextPrimary, fontFamily = PoppinsFamily)
                                }
                                Button(onClick = { showTopUpDialog = true }, shape = RoundedCornerShape(24.dp), colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue)) {
                                    Icon(Icons.Default.AddCard, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Top Up", fontWeight = FontWeight.SemiBold, fontFamily = InterFamily)
                                }
                            }
                        }
                    }
                    item { Text(text = "Riwayat Transaksi (sinkron database pesantren)", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily, modifier = Modifier.padding(top = 4.dp)) }
                    if (sakuHistory.isEmpty()) {
                        item { Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) { Text("Belum ada transaksi", color = TextMuted, fontFamily = InterFamily, fontSize = 13.sp) } }
                    }
                    items(sakuHistory) { item -> UangSakuHistoryCard(item = item, currencyFormat = currencyFormat) }
                }
            }
        }
    }

    if (activeCheckout != null) {
        val checkout = activeCheckout!!
        AlertDialog(
            onDismissRequest = { activeCheckout = null },
            title = { Text("Pembayaran via PaymentKu", fontWeight = FontWeight.Bold, color = TextPrimary, fontFamily = PoppinsFamily, fontSize = 16.sp) },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(checkout.title, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily)
                    Text(currencyFormat.format(checkout.totalAmount), fontSize = 20.sp, fontWeight = FontWeight.Bold, color = SolidRoyalBlue, fontFamily = PoppinsFamily, modifier = Modifier.padding(vertical = 8.dp))
                    Surface(shape = RoundedCornerShape(24.dp), color = Color(0xFFEFF6FF), modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.QrCode2, contentDescription = "QRIS", tint = SolidRoyalBlue, modifier = Modifier.size(64.dp))
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("QRIS / Virtual Account", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = SolidRoyalBlue, fontFamily = InterFamily)
                            Text("BCA • Mandiri • BNI • BSI • GoPay • OVO • DANA", fontSize = 10.sp, color = TextSecondary, fontFamily = InterFamily)
                            Text("Terintegrasi paymentku.com → rekening pesantren", fontSize = 9.sp, color = TextMuted, fontFamily = InterFamily)
                        }
                    }
                    Text("ID: ${checkout.externalId}", fontSize = 10.sp, color = TextMuted, fontFamily = InterFamily)
                    if (checkout.checkoutUrl.isNotBlank()) Text(checkout.checkoutUrl, fontSize = 9.sp, color = SolidRoyalBlue, fontFamily = InterFamily, maxLines = 2)
                }
            },
            confirmButton = {
                Button(onClick = {
                    scope.launch {
                        val result = repository.confirmPayment(checkout.billId)
                        if (result.isSuccess) {
                            Toast.makeText(context, "Pembayaran terverifikasi! Kwitansi terbit otomatis.", Toast.LENGTH_SHORT).show()
                            activeCheckout = null; refresh()
                        } else Toast.makeText(context, result.exceptionOrNull()?.message ?: "Belum lunas di gateway", Toast.LENGTH_LONG).show()
                    }
                }, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F9D6A), contentColor = Color.White), shape = RoundedCornerShape(24.dp)) {
                    Text("Konfirmasi Lunas", fontWeight = FontWeight.SemiBold, fontFamily = InterFamily)
                }
            },
            dismissButton = { TextButton(onClick = { activeCheckout = null }) { Text("Tutup", color = TextSecondary, fontFamily = InterFamily) } }
        )
    }

    if (showTopUpDialog) {
        var topUpNominal by remember { mutableStateOf("100000") }
        var topUpMethod by remember { mutableStateOf("paymentku") }
        var isProcessing by remember { mutableStateOf(false) }
        AlertDialog(
            onDismissRequest = { if (!isProcessing) showTopUpDialog = false },
            title = { Text("Top Up Uang Saku", fontWeight = FontWeight.Bold, color = TextPrimary, fontFamily = PoppinsFamily) },
            text = {
                Column {
                    Text("Pilih nominal:", fontSize = 12.sp, color = TextSecondary, fontFamily = InterFamily)
                    Spacer(modifier = Modifier.height(8.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("50000", "100000", "200000", "500000", "1000000").forEach { nom ->
                            OutlinedButton(
                                onClick = { topUpNominal = nom }, modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(24.dp),
                                colors = if (topUpNominal == nom) ButtonDefaults.outlinedButtonColors(containerColor = Color(0xFFEFF6FF), contentColor = SolidRoyalBlue) else ButtonDefaults.outlinedButtonColors(),
                                border = if (topUpNominal == nom) ButtonDefaults.outlinedButtonBorder.copy(width = 1.5.dp) else ButtonDefaults.outlinedButtonBorder
                            ) {
                                Text("Rp " + NumberFormat.getNumberInstance(localeID).format(nom.toDouble()), fontWeight = FontWeight.SemiBold, fontFamily = InterFamily)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                    Text("Metode pembayaran:", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(selected = topUpMethod == "paymentku", onClick = { topUpMethod = "paymentku" }, label = { Text("PaymentKu QRIS", fontSize = 11.sp, fontFamily = InterFamily) }, colors = FilterChipDefaults.filterChipColors(selectedContainerColor = SolidRoyalBlue, selectedLabelColor = Color.White))
                        FilterChip(selected = topUpMethod == "transfer_manual", onClick = { topUpMethod = "transfer_manual" }, label = { Text("Transfer Rekening", fontSize = 11.sp, fontFamily = InterFamily) }, colors = FilterChipDefaults.filterChipColors(selectedContainerColor = SolidRoyalBlue, selectedLabelColor = Color.White))
                    }
                    Text(if (topUpMethod == "paymentku") "QRIS/VA paymentku.com otomatis ke rekening pesantren." else "Transfer langsung ke rekening resmi pesantren (sinkron DB).", fontSize = 10.sp, color = TextMuted, fontFamily = InterFamily, modifier = Modifier.padding(top = 4.dp))
                }
            },
            confirmButton = {
                Button(
                    enabled = !isProcessing,
                    onClick = {
                        scope.launch {
                            isProcessing = true
                            val amt = topUpNominal.toDoubleOrNull() ?: 100000.0
                            val method = if (topUpMethod == "paymentku") "paymentku" else "transfer_manual"
                            val res = repository.topUpUangSaku(amt, method)
                            isProcessing = false
                            if (res.isSuccess) {
                                saldoSaku = res.getOrNull()?.saldo ?: (saldoSaku + amt)
                                // Refresh history dari server agar tidak pakai dummy
                                val fresh = repository.getUangSaku()
                                if (fresh.isSuccess) {
                                    saldoSaku = fresh.getOrNull()?.saldo ?: saldoSaku
                                    sakuHistory = fresh.getOrNull()?.history ?: sakuHistory
                                }
                                val msg = if (method == "paymentku") "Checkout PaymentKu dibuat. Selesaikan QRIS/VA ke rekening pesantren." else "Top up ke rekening pesantren berhasil, saldo real bertambah."
                                Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                                showTopUpDialog = false
                                refresh()
                            } else Toast.makeText(context, res.exceptionOrNull()?.message ?: "Gagal top up", Toast.LENGTH_LONG).show()
                        }
                    }, shape = RoundedCornerShape(24.dp), colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue)
                ) { if (isProcessing) CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White, strokeWidth = 2.dp) else Text(if (topUpMethod == "paymentku") "Bayar via PaymentKu" else "Konfirmasi Transfer", color = Color.White, fontWeight = FontWeight.SemiBold, fontFamily = InterFamily, fontSize = 12.sp) }
            },
            dismissButton = { TextButton(enabled = !isProcessing, onClick = { showTopUpDialog = false }) { Text("Batal", color = TextSecondary, fontFamily = InterFamily) } }
        )
    }
}

@Composable
fun BillItemCard(
    bill: TagihanItem,
    currencyFormat: NumberFormat,
    onPay: () -> Unit,
    onShowKwitansi: () -> Unit
) {
    val isPaid = bill.status.equals("paid", ignoreCase = true)
    val isPending = bill.status.equals("pending", ignoreCase = true)
    Surface(shape = RoundedCornerShape(24.dp), color = Color.White, shadowElevation = 1.5.dp, modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Surface(color = when { isPaid -> Color(0xFFDEF7EC); isPending -> Color(0xFFFEF3C7); else -> Color(0xFFFEE2E2) }, shape = RoundedCornerShape(8.dp)) {
                    Text(text = when { isPaid -> "LUNAS"; isPending -> "MENUNGGU"; else -> "BELUM BAYAR" }, color = when { isPaid -> Color(0xFF065F46); isPending -> Color(0xFF92400E); else -> Color(0xFF991B1B) }, fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = InterFamily, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                }
                Text(text = bill.billNo, fontSize = 10.sp, color = TextMuted, fontFamily = InterFamily)
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(text = bill.title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily)
            Text(text = "Jatuh Tempo: ${bill.dueDate ?: "-"}", fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily)
            Spacer(modifier = Modifier.height(14.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("Total Tagihan", fontSize = 10.sp, color = TextMuted, fontFamily = InterFamily)
                    Text(text = currencyFormat.format(bill.totalAmount), fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextPrimary, fontFamily = PoppinsFamily)
                }
                if (isPaid) {
                    Button(onClick = onShowKwitansi, colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue), shape = RoundedCornerShape(24.dp), contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Kwitansi", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, fontFamily = InterFamily)
                    }
                } else {
                    Button(onClick = onPay, colors = ButtonDefaults.buttonColors(containerColor = SolidRoyalBlue), shape = RoundedCornerShape(24.dp), contentPadding = PaddingValues(horizontal = 18.dp, vertical = 8.dp)) {
                        Icon(Icons.Default.QrCode2, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isPending) "Lanjutkan Bayar" else "Bayar QRIS", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, fontFamily = InterFamily)
                    }
                }
            }
        }
    }
}

@Composable
fun UangSakuHistoryCard(
    item: UangSakuItem,
    currencyFormat: NumberFormat
) {
    val isTopUp = item.type == "topup"
    Surface(shape = RoundedCornerShape(24.dp), color = Color.White, shadowElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(shape = RoundedCornerShape(16.dp), color = if (isTopUp) Color(0xFFDEF7EC) else Color(0xFFFFF7ED), modifier = Modifier.size(42.dp)) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                    Icon(imageVector = if (isTopUp) Icons.Default.ArrowDownward else Icons.Default.ShoppingCart, contentDescription = null, tint = if (isTopUp) Color(0xFF059669) else Color(0xFFEA580C), modifier = Modifier.size(20.dp))
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = item.description, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = InterFamily)
                Text(text = "${item.merchantName ?: "Pesantren"} • ${item.createdAt ?: ""}", fontSize = 11.sp, color = TextSecondary, fontFamily = InterFamily)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(text = (if (isTopUp) "+" else "-") + currencyFormat.format(item.amount), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = if (isTopUp) Color(0xFF059669) else Color(0xFFE11D48), fontFamily = InterFamily)
                Text(text = "Sisa: ${currencyFormat.format(item.balanceAfter)}", fontSize = 10.sp, color = TextMuted, fontFamily = InterFamily)
            }
        }
    }
}
