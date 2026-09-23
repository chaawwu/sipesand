package id.web.sipesand.ananda.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
    onCenterActionClick: () -> Unit = {}
) {
    // 5 items: Beranda, Jadwal, [FAB Scan], Keuangan, Perizinan
    // Anti-AI: melengkung top 24 radius, shadow sangat halus, central FAB bulat solid blue
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .height(76.dp)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .shadow(8.dp, RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp), clip = false),
            color = Color.White,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(68.dp)
                    .padding(horizontal = 8.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left 2 items
                BottomNavButton("dashboard", "Beranda", Icons.Filled.Home, Icons.Outlined.Home, currentRoute, onNavigate, currentRoute == "dashboard")
                BottomNavButton("akademik", "Jadwal", Icons.Filled.CalendarMonth, Icons.Outlined.CalendarMonth, currentRoute, onNavigate, currentRoute == "akademik" || currentRoute == "grades" || currentRoute == "tahfidz" || currentRoute == "attendance")
                // Center spacer for FAB
                Spacer(modifier = Modifier.width(56.dp))
                // Right 2 items
                BottomNavButton("fees", "Keuangan", Icons.Filled.AccountBalanceWallet, Icons.Outlined.AccountBalanceWallet, currentRoute, onNavigate, currentRoute == "fees")
                BottomNavButtonWithBadge("perizinan", "Izin", Icons.Filled.Assignment, Icons.Outlined.Assignment, currentRoute, onNavigate, currentRoute == "perizinan", 0)
            }
        }

        // Central FAB - bulat perfect circle, solid Royal Blue, icon scan QR/QRIS
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = (-12).dp)
                .size(56.dp)
                .shadow(6.dp, CircleShape, clip = false)
                .clip(CircleShape)
                .background(SolidRoyalBlue)
                .clickable { onCenterActionClick() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Filled.QrCodeScanner,
                contentDescription = "Scan QRIS / RFID",
                tint = Color.White,
                modifier = Modifier.size(26.dp)
            )
        }
    }
}

@Composable
private fun BottomNavButton(
    route: String,
    label: String,
    iconFilled: ImageVector,
    iconOutlined: ImageVector,
    currentRoute: String,
    onNavigate: (String) -> Unit,
    isSelected: Boolean
) {
    Column(
        modifier = Modifier
            .clickable { onNavigate(route) }
            .padding(horizontal = 12.dp, vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = if (isSelected) iconFilled else iconOutlined,
            contentDescription = label,
            tint = if (isSelected) SolidRoyalBlue else TextMuted,
            modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.height(3.dp))
        Text(
            text = label,
            color = if (isSelected) SolidRoyalBlue else TextMuted,
            fontSize = 10.sp,
            fontFamily = InterFamily,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
        )
    }
}

@Composable
private fun BottomNavButtonWithBadge(
    route: String,
    label: String,
    iconFilled: ImageVector,
    iconOutlined: ImageVector,
    currentRoute: String,
    onNavigate: (String) -> Unit,
    isSelected: Boolean,
    badgeCount: Int
) {
    Column(
        modifier = Modifier
            .clickable { onNavigate(route) }
            .padding(horizontal = 12.dp, vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box {
            Icon(
                imageVector = if (isSelected) iconFilled else iconOutlined,
                contentDescription = label,
                tint = if (isSelected) SolidRoyalBlue else TextMuted,
                modifier = Modifier.size(22.dp)
            )
            if (badgeCount > 0) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = 5.dp, y = (-3).dp)
                        .size(7.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEF4444))
                )
            }
        }
        Spacer(modifier = Modifier.height(3.dp))
        Text(
            text = label,
            color = if (isSelected) SolidRoyalBlue else TextMuted,
            fontSize = 10.sp,
            fontFamily = InterFamily,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
        )
    }
}
