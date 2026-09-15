package id.web.sipesand.ananda.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import id.web.sipesand.ananda.ui.theme.*

data class BottomNavItem(
    val route: String,
    val label: String,
    val iconSelected: ImageVector,
    val iconUnselected: ImageVector,
    val badgeCount: Int = 0
)

@Composable
fun BottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    unreadChatCount: Int = 0,
    unreadNotifCount: Int = 0,
    onCenterActionClick: () -> Unit = {}
) {
    val navItems = listOf(
        BottomNavItem("dashboard", "Beranda", Icons.Filled.Home, Icons.Outlined.Home),
        BottomNavItem("akademik", "Jadwal", Icons.Filled.CalendarMonth, Icons.Outlined.CalendarMonth),
        BottomNavItem("chat", "Chat", Icons.Filled.ChatBubble, Icons.Outlined.ChatBubbleOutline, unreadChatCount),
        BottomNavItem("fees", "Keuangan", Icons.Filled.AccountBalanceWallet, Icons.Outlined.AccountBalanceWallet),
        BottomNavItem("perizinan", "Perizinan", Icons.Filled.Assignment, Icons.Outlined.Assignment)
    )

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .border(width = 1.dp, color = BorderColor),
        color = SurfaceCard,
        shadowElevation = 4.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .height(64.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            navItems.forEach { item ->
                val isSelected = currentRoute == item.route || (item.route == "akademik" && (currentRoute == "grades" || currentRoute == "tahfidz" || currentRoute == "attendance"))
                val itemColor = if (isSelected) RoyalBluePrimary else TextMuted

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clickable { onNavigate(item.route) }
                        .padding(top = 8.dp, bottom = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = if (isSelected) item.iconSelected else item.iconUnselected,
                            contentDescription = item.label,
                            tint = itemColor,
                            modifier = Modifier.size(23.dp)
                        )

                        // Static badge indicator (No ping/pulse animation)
                        if (item.badgeCount > 0) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .offset(x = 6.dp, y = (-4).dp)
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFEF4444))
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = item.label,
                        color = itemColor,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }
    }
}
