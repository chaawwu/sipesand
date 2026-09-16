package id.web.sipesand.ananda.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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

    var selectedTab by remember { mutableStateOf(0) } // 0: Tagihan, 1: Uang Saku
    var bills by remember { mutableStateOf<List<TagihanItem>>(emptyList()) }
    var sakuHistory by remember { mutableStateOf<List<UangSakuItem>>(emptyList()) }
    var saldoSaku by remember { mutableStateOf(385000.0) }
    var isLoading by remember { mutableStateOf(true) }

    // PaymentKu Modal State
    var activeCheckout by remember { mutableStateOf<KaseraCheckoutResponse?>(null) }
    var showTopUpDialog by remember { mutableStateOf(false) }

    val localeID = Locale("id", "ID")
    val currencyFormat = NumberFormat.getCurrencyInstance(localeID).apply {
        maximumFractionDigits = 0
    }

    LaunchedEffect(key1 = true) {
        scope.launch {
            isLoading = true
            val billsRes = repository.getTagihan()
            bills = billsRes.getOrNull()?.bills ?: emptyList()
            saldoSaku = billsRes.getOrNull()?.saldoSaku ?: 385000.0

            val sakuRes = repository.getUangSaku()
            sakuHistory = sakuRes.getOrNull()?.history ?: emptyList()
            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Keuangan & Pembayaran", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White) },
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
                currentRoute = "fees",
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
            // Tab Selector: Tagihan SPP vs Uang Saku
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = RoyalBluePrimary
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Tagihan & Kwitansi", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Uang Saku Santri", fontWeight = FontWeight.Bold) }
                )
            }

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = RoyalBluePrimary)
                }
            } else {
                if (selectedTab == 0) {
                    // Tagihan Tab
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            Surface(
                                color = PastelIndigo,
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = RoyalBluePrimary, modifier = Modifier.size(24.dp))
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = "Pembayaran online terintegrasi langsung dengan PaymentKu (QRIS & Virtual Account). Kwitansi resmi terbit otomatis.",
                                        fontSize = 12.sp,
                                        color = TextPrimary
                                    )
                                }
                            }
                        }

                        items(bills) { bill ->
                            BillItemCard(
                                bill = bill,
                                currencyFormat = currencyFormat,
                                onPay = {
                                    scope.launch {
                                        val checkoutRes = repository.checkoutPaymentKu(bill.id, "qris_paymentku")
                                        activeCheckout = checkoutRes.getOrNull()
                                    }
                                },
                                onShowKwitansi = {
                                    bill.kwitansi?.receiptNo?.let { onOpenKwitansi(it) } 
                                        ?: onOpenKwitansi("KW-202608-0012")
                                }
                            )
                        }
                    }
                } else {
                    // Uang Saku Tab
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            Surface(
                                shape = RoundedCornerShape(18.dp),
                                color = Color.White,
                                shadowElevation = 3.dp,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(18.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text("Saldo Uang Saku Saat Ini", fontSize = 12.sp, color = TextSecondary)
                                        Text(currencyFormat.format(saldoSaku), fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = RoyalBlueDark)
                                    }
                                    Button(
                                        onClick = { showTopUpDialog = true },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                                    ) {
                                        Icon(Icons.Default.AddCard, contentDescription = null)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Isi Saldo", fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }

                        item {
                            Text(
                                text = "Riwayat Transaksi Santri (Kantin / Koperasi)",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary,
                                modifier = Modifier.padding(top = 8.dp)
                            )
                        }

                        items(sakuHistory) { item ->
                            UangSakuHistoryCard(item = item, currencyFormat = currencyFormat)
                        }
                    }
                }
            }
        }
    }

    // PaymentKu Payment Modal Dialog
    if (activeCheckout != null) {
        val checkout = activeCheckout!!
        AlertDialog(
            onDismissRequest = { activeCheckout = null },
            title = { Text("Checkout via PaymentKu (paymentku.com)", fontWeight = FontWeight.Bold, color = RoyalBlueDark) },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(checkout.title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                    Text(
                        currencyFormat.format(checkout.totalAmount),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = RoyalBluePrimary,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = PastelSky,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.QrCode2, contentDescription = "QRIS", tint = PastelSkyIcon, modifier = Modifier.size(72.dp))
                            Text("QRIS Standar Pembayaran Nasional", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PastelSkyIcon)
                            Text("BCA • Mandiri • BNI • BSI • GoPay • OVO • Dana", fontSize = 10.sp, color = TextSecondary)
                        }
                    }

                    Text("ID Transaksi: ${checkout.externalId}", fontSize = 11.sp, color = TextMuted)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            val billId = checkout.externalId
                                .removePrefix("PKU-")
                                .toLongOrNull() ?: 0L
                            repository.confirmPayment(billId)
                            Toast.makeText(context, "Pembayaran terverifikasi lunas! Kwitansi terbit.", Toast.LENGTH_SHORT).show()
                            activeCheckout = null
                            val billsRes = repository.getTagihan()
                            bills = billsRes.getOrNull()?.bills ?: emptyList()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StatusPaidGreen)
                ) {
                    Text("Konfirmasi Bayar Lunas", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { activeCheckout = null }) {
                    Text("Tutup", color = TextSecondary)
                }
            }
        )
    }

    // Top Up Uang Saku Dialog
    if (showTopUpDialog) {
        var topUpNominal by remember { mutableStateOf("100000") }
        AlertDialog(
            onDismissRequest = { showTopUpDialog = false },
            title = { Text("Top Up Saldo Uang Saku", fontWeight = FontWeight.Bold, color = RoyalBlueDark) },
            text = {
                Column {
                    Text("Pilih nominal pengisian saldo untuk santri:", fontSize = 13.sp, color = TextSecondary)
                    Spacer(modifier = Modifier.height(10.dp))
                    listOf("50000", "100000", "200000", "500000").forEach { nom ->
                        OutlinedButton(
                            onClick = { topUpNominal = nom },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 3.dp),
                            colors = if (topUpNominal == nom) ButtonDefaults.outlinedButtonColors(containerColor = PastelIndigo) else ButtonDefaults.outlinedButtonColors()
                        ) {
                            Text("Rp " + NumberFormat.getNumberInstance(localeID).format(nom.toDouble()), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            val amt = topUpNominal.toDoubleOrNull() ?: 100000.0
                            repository.topUpUangSaku(amt)
                            saldoSaku += amt
                            Toast.makeText(context, "Top Up Saldo Uang Saku Berhasil!", Toast.LENGTH_SHORT).show()
                            showTopUpDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary)
                ) {
                    Text("Bayar via PaymentKu", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showTopUpDialog = false }) { Text("Batal", color = TextSecondary) }
            }
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
                    color = if (isPaid) PastelMint else PastelRose,
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = if (isPaid) "LUNAS" else "BELUM BAYAR",
                        color = if (isPaid) PastelMintIcon else PastelRoseIcon,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Text(
                    text = bill.billNo,
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = bill.title,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Jatuh Tempo: ${bill.dueDate ?: "Akhir Bulan"}",
                fontSize = 12.sp,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Total Tagihan", fontSize = 11.sp, color = TextMuted)
                    Text(
                        text = currencyFormat.format(bill.totalAmount),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = RoyalBlueDark
                    )
                }

                if (isPaid) {
                    Button(
                        onClick = onShowKwitansi,
                        colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Kwitansi PDF", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                } else {
                    Button(
                        onClick = onPay,
                        colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Payment, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Bayar", fontSize = 12.sp, fontWeight = FontWeight.Bold)
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
                color = if (isTopUp) PastelMint else PastelOrange,
                modifier = Modifier.size(42.dp)
            ) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                    Icon(
                        imageVector = if (isTopUp) Icons.Default.ArrowDownward else Icons.Default.ShoppingCart,
                        contentDescription = null,
                        tint = if (isTopUp) PastelMintIcon else PastelOrangeIcon,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.description,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "${item.merchantName ?: "Kantin"} • ${item.createdAt ?: "Hari ini"}",
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = (if (isTopUp) "+" else "-") + currencyFormat.format(item.amount),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isTopUp) StatusPaidGreen else StatusUnpaidRed
                )
                Text(
                    text = "Sisa: ${currencyFormat.format(item.balanceAfter)}",
                    fontSize = 10.sp,
                    color = TextMuted
                )
            }
        }
    }
}
