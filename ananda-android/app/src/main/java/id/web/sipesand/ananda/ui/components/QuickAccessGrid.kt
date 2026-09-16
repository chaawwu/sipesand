package id.web.sipesand.ananda.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import id.web.sipesand.ananda.ui.theme.*

data class QuickAccessItem(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val bgColor: Color,
    val iconColor: Color,
    val route: String
)

@Composable
fun QuickAccessGrid(
    onItemClick: (String) -> Unit
) {
    // 12 Items in 3 Columns Grid strictly matching Reference Image 2
    val items = listOf(
        QuickAccessItem("Profil", "Biodata santri", Icons.Outlined.Person, PastelPurple, PastelPurpleIcon, "profile"),
        QuickAccessItem("Uang Saku", "Saldo & mutasi", Icons.Outlined.AccountBalanceWallet, PastelOrange, PastelOrangeIcon, "uang_saku"),
        QuickAccessItem("Pembayaran", "SPP & asrama", Icons.Outlined.CreditCard, PastelSky, PastelSkyIcon, "fees"),
        QuickAccessItem("Kwitansi", "Unduh PDF", Icons.Outlined.ReceiptLong, PastelMint, PastelMintIcon, "kwitansi"),
        QuickAccessItem("Top Up", "Isi saldo online", Icons.Outlined.AddCard, PastelRose, PastelRoseIcon, "topup"),
        QuickAccessItem("Jadwal", "KBM & kegiatan", Icons.Outlined.CalendarMonth, PastelAmber, PastelAmberIcon, "akademik"),
        QuickAccessItem("Nilai", "Raport semester", Icons.Outlined.Analytics, PastelSky, PastelSkyIcon, "nilai"),
        QuickAccessItem("Absensi", "Kehadiran santri", Icons.Outlined.FactCheck, PastelTeal, PastelTealIcon, "absensi"),
        QuickAccessItem("Hafalan", "Tahfidz Qur'an", Icons.Outlined.MenuBook, PastelViolet, PastelVioletIcon, "tahfidz"),
        QuickAccessItem("Perizinan", "Izin pulang", Icons.Outlined.Assignment, PastelEmerald, PastelEmeraldIcon, "perizinan"),
        QuickAccessItem("Laporan", "Rekap biaya", Icons.Outlined.Assessment, PastelSlate, PastelSlateIcon, "laporan"),
        QuickAccessItem("Pengumuman", "Kabar ma'had", Icons.Outlined.Campaign, PastelIndigo, PastelIndigoIcon, "notices")
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Akses Cepat",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "12 Fitur",
                fontSize = 12.sp,
                color = TextSecondary,
                fontWeight = FontWeight.Medium
            )
        }

        // 3 Columns Grid (chunked by 3)
        val chunked = items.chunked(3)
        chunked.forEach { rowItems ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 5.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                rowItems.forEach { item ->
                    QuickAccessCard(
                        item = item,
                        onClick = { onItemClick(item.route) },
                        modifier = Modifier.weight(1f)
                    )
                }
                if (rowItems.size < 3) {
                    repeat(3 - rowItems.size) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
fun QuickAccessCard(
    item: QuickAccessItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .height(116.dp)
            .shadow(
                elevation = 1.5.dp,
                shape = RoundedCornerShape(18.dp),
                spotColor = Color(0x15000000)
            )
            .clip(RoundedCornerShape(18.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        color = item.bgColor
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(10.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Top Row: Circular Icon & Chevron Right
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(item.iconColor),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.title,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Icon(
                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                    contentDescription = null,
                    tint = TextSecondary.copy(alpha = 0.5f),
                    modifier = Modifier
                        .size(16.dp)
                        .padding(top = 2.dp)
                )
            }

            // Bottom Column: Title & Subtitle
            Column {
                Text(
                    text = item.title,
                    color = TextPrimary,
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = item.subtitle,
                    color = TextSecondary,
                    fontSize = 10.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 13.sp
                )
            }
        }
    }
}
