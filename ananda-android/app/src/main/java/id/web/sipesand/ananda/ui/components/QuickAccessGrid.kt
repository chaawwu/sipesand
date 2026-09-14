package id.web.sipesand.ananda.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
    val bgColor: Color,
    val iconColor: Color,
    val route: String
)

@Composable
fun QuickAccessGrid(
    onItemClick: (String) -> Unit
) {
    // 12 Items matching Image 2 perfectly
    val items = listOf(
        QuickAccessItem("Profile", Icons.Outlined.Person, PastelIndigo, PastelIndigoIcon, "profile"),
        QuickAccessItem("Events", Icons.Outlined.CalendarMonth, PastelAmber, PastelAmberIcon, "events"),
        QuickAccessItem("Staffs", Icons.Outlined.Groups, PastelMint, PastelMintIcon, "staffs"),
        QuickAccessItem("Attendance", Icons.Outlined.FactCheck, PastelSky, PastelSkyIcon, "attendance"),
        QuickAccessItem("Chatbox", Icons.Outlined.Chat, PastelPurple, PastelPurpleIcon, "chat"),
        QuickAccessItem("GradeSheet", Icons.Outlined.Description, PastelRose, PastelRoseIcon, "grades"),
        QuickAccessItem("Gallery", Icons.Outlined.Image, PastelOrange, PastelOrangeIcon, "gallery"),
        QuickAccessItem("Fees Details", Icons.Outlined.CreditCard, PastelViolet, PastelVioletIcon, "fees"),
        QuickAccessItem("Notices", Icons.Outlined.Campaign, PastelCyan, PastelCyanIcon, "notices"),
        QuickAccessItem("Assignments", Icons.Outlined.MenuBook, PastelTeal, PastelTealIcon, "tahfidz"),
        QuickAccessItem("Exams", Icons.Outlined.EmojiEvents, PastelEmerald, PastelEmeraldIcon, "exams"),
        QuickAccessItem("Library", Icons.Outlined.LocalLibrary, PastelSlate, PastelSlateIcon, "library")
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
                text = "Menu Utama & Layanan",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "12 Fitur Aktif",
                fontSize = 12.sp,
                color = TextSecondary
            )
        }

        // 3 rows x 4 columns = 12 items
        val chunked = items.chunked(4)
        chunked.forEach { rowItems ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                rowItems.forEach { item ->
                    QuickAccessCard(
                        item = item,
                        onClick = { onItemClick(item.route) },
                        modifier = Modifier.weight(1f)
                    )
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
    Column(
        modifier = modifier
            .padding(horizontal = 4.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = item.bgColor,
            shadowElevation = 1.dp,
            modifier = Modifier.size(56.dp)
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.fillMaxSize()
            ) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = item.title,
                    tint = item.iconColor,
                    modifier = Modifier.size(26.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = item.title,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = TextPrimary,
            textAlign = TextAlign.Center,
            maxLines = 1
        )
    }
}
