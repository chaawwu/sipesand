package id.web.sipesand.ananda.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import id.web.sipesand.ananda.AnandaApp
import id.web.sipesand.ananda.ui.theme.*
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KwitansiScreen(
    receiptNo: String,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val localeID = Locale("id", "ID")
    val currencyFormat = NumberFormat.getCurrencyInstance(localeID).apply { maximumFractionDigits = 0 }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Kwitansi Resmi Sah", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        Toast.makeText(context, "Kwitansi tersimpan ke Dokumen/Download PDF", Toast.LENGTH_LONG).show()
                    }) {
                        Icon(Icons.Default.Download, contentDescription = "Unduh PDF", tint = Color.White)
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
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Receipt Card Paper
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color.White,
                shadowElevation = 4.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    // Header Royal Blue
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(RoyalBlueDark)
                            .padding(20.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Pondok Pesantren Darul Rahman",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Jakarta Selatan • Telp: 021-78901234",
                                    fontSize = 11.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "KWITANSI RESMI",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF93C5FD)
                                )
                                Text(
                                    text = receiptNo,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }

                    // Content Rows
                    Column(modifier = Modifier.padding(20.dp)) {
                        KwitansiRow(label = "Telah Terima Dari", value = AnandaApp.getWaliName())
                        KwitansiRow(label = "Nama Santri", value = "${AnandaApp.getSantriName()} (${AnandaApp.getSantriNis()})")
                        KwitansiRow(label = "Kelas / Asrama", value = "3 Aliyah • Kamar Al-Fatih 04")
                        KwitansiRow(label = "Untuk Pembayaran", value = "SPP Syahriyah & Operasional Santri Bulan September 2026")
                        KwitansiRow(label = "Kanal Transaksi", value = "KASERAPAY (QRIS INSTANT NATIONAL)")
                        KwitansiRow(label = "Status Verifikasi", value = "LUNAS (Otentikasi Sistem Digital)")

                        Spacer(modifier = Modifier.height(16.dp))

                        // Amount Highlight Box
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = PastelIndigo,
                            border = androidx.compose.foundation.BorderStroke(1.dp, RoyalBluePrimary.copy(alpha = 0.3f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = currencyFormat.format(450000.0),
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = RoyalBlueDark
                                )
                                Text(
                                    text = "# Empat Ratus Lima Puluh Ribu Rupiah #",
                                    fontSize = 12.sp,
                                    fontStyle = FontStyle.Italic,
                                    color = TextSecondary,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Footer Stamp & Signature
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Bottom
                        ) {
                            // Official Stamp
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color.White,
                                modifier = Modifier.border(2.dp, StatusPaidGreen, RoundedCornerShape(8.dp))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.Verified, contentDescription = null, tint = StatusPaidGreen, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "LUNAS SAH",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = StatusPaidGreen
                                    )
                                }
                            }

                            // Signature
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Bendahara Pesantren", fontSize = 11.sp, color = TextSecondary)
                                Spacer(modifier = Modifier.height(36.dp))
                                Text("Hj. Siti Fatimah, S.E.", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            Button(
                onClick = {
                    Toast.makeText(context, "Membuka printer sistem untuk cetak Kwitansi PDF...", Toast.LENGTH_SHORT).show()
                },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = RoyalBluePrimary),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Icon(Icons.Default.Print, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Cetak / Simpan Kwitansi PDF", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun KwitansiRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Text(text = label, fontSize = 12.sp, color = TextSecondary, modifier = Modifier.width(130.dp))
        Text(text = ": $value", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, modifier = Modifier.weight(1f))
    }
}
