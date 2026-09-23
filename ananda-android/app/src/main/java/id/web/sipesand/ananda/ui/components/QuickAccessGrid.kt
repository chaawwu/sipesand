package id.web.sipesand.ananda.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import id.web.sipesand.ananda.ui.theme.*

data class QuickAccessItem(
    val title: String,
    val icon: ImageVector,
    val route: String
)

@Composable
fun QuickAccessGrid(
    onItemClick: (String) -> Unit
) {
    // Brief: 2x3 grid outline konsisten: Profil, Absensi RFID, Uang Saku, Pembayaran QRIS, Jadwal, Nilai
    // Anti-AI: cardless feel = white cards with 24 radius, very soft shadow, outline thin icons blue + pastel ungu
    val items = listOf(
        QuickAccessItem("Profil", Icons.Outlined.Person, "profile"),
        QuickAccessItem("Absensi RFID", Icons.Outlined.Nfc, "absensi"),
        QuickAccessItem("Uang Saku", Icons.Outlined.AccountBalanceWallet, "uang_saku"),
        QuickAccessItem("Pembayaran", Icons.Outlined.QrCode2, "fees"),
        QuickAccessItem("Jadwal", Icons.Outlined.CalendarMonth, "akademik"),
        QuickAccessItem("Nilai", Icons.Outlined.Grade, "nilai"),
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Text(
            text = "Menu Utama",
            fontSize = 15.sp,
            fontFamily = PoppinsFamily,
            fontWeight = FontWeight.SemiBold,
            color = TextPrimary,
            modifier = Modifier.padding(bottom = 12.dp, top = 4.dp)
        )

        // 2 rows x 3 cols
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items.chunked(3).forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    row.forEach { item ->
                        QuickOutlineCard(
                            item = item,
                            onClick = { onItemClick(item.route) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (row.size < 3) repeat(3 - row.size) { Spacer(modifier = Modifier.weight(1f)) }
                }
            }
        }
    }
}

@Composable
fun QuickOutlineCard(
    item: QuickAccessItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Cardless premium: white background, 24 radius, shadow 1.5 halus, no gradient
    Surface(
        modifier = modifier
            .height(112.dp)
            .shadow(elevation = 1.5.dp, shape = RoundedCornerShape(24.dp), spotColor = Color(0x12000000), ambientColor = Color(0x08000000))
            .clip(RoundedCornerShape(24.dp))
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(24.dp),
        color = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Outline thin icon container - 48 circle pastel soft blue/purple alternate
            val pastelBg = when (item.title) {
                "Profil" -> Color(0xFFEFF6FF)
                "Absensi RFID" -> Color(0xFFF5F3FF)
                "Uang Saku" -> Color(0xFFFEF3C7)
                "Pembayaran" -> Color(0xFFEFF6FF)
                "Jadwal" -> Color(0xFFF0FDF4)
                else -> Color(0xFFFDF2F8)
            }
            val iconTint = when (item.title) {
                "Profil" -> Color(0xFF2563EB)
                "Absensi RFID" -> Color(0xFF7C3AED)
                "Uang Saku" -> Color(0xFFD97706)
                "Pembayaran" -> Color(0xFF1E40AF)
                "Jadwal" -> Color(0xFF059669)
                else -> Color(0xFFDB2777)
            }
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(pastelBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = item.title,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = item.title,
                color = TextPrimary,
                fontSize = 12.sp,
                fontFamily = InterFamily,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center,
                maxLines = 1,
                lineHeight = 14.sp
            )
            Text(
                text = when(item.title){
                    "Profil" -> "Biodata"
                    "Absensi RFID" -> "Kehadiran"
                    "Uang Saku" -> "Saldo"
                    "Pembayaran" -> "QRIS"
                    "Jadwal" -> "KBM"
                    else -> "Rapor"
                },
                color = TextSecondary,
                fontSize = 10.sp,
                fontFamily = InterFamily,
                textAlign = TextAlign.Center
            )
        }
    }
}
