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

@Composable
fun BottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    onCenterActionClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(84.dp),
        contentAlignment = Alignment.BottomCenter
    ) {
        // Main Navigation Surface
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .shadow(elevation = 12.dp, shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)),
            color = Color.White,
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 8.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Tab 1: Home
                NavTabItem(
                    label = "Home",
                    icon = if (currentRoute == "dashboard") Icons.Filled.Home else Icons.Outlined.Home,
                    isSelected = currentRoute == "dashboard",
                    onClick = { onNavigate("dashboard") }
                )

                // Tab 2: Keuangan
                NavTabItem(
                    label = "Keuangan",
                    icon = if (currentRoute == "fees") Icons.Filled.AccountBalanceWallet else Icons.Outlined.AccountBalanceWallet,
                    isSelected = currentRoute == "fees",
                    onClick = { onNavigate("fees") }
                )

                // Gap for Center FAB
                Spacer(modifier = Modifier.width(48.dp))

                // Tab 3: Chat
                NavTabItem(
                    label = "Chat",
                    icon = if (currentRoute == "chat") Icons.Filled.ChatBubble else Icons.Outlined.ChatBubbleOutline,
                    isSelected = currentRoute == "chat",
                    onClick = { onNavigate("chat") }
                )

                // Tab 4: Profil
                NavTabItem(
                    label = "Profil",
                    icon = if (currentRoute == "profile") Icons.Filled.AccountCircle else Icons.Outlined.AccountCircle,
                    isSelected = currentRoute == "profile",
                    onClick = { onNavigate("profile") }
                )
            }
        }

        // Center Elevated Floating Action Button (Izin Pulang / Scan QR Satpam)
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = (-4).dp)
        ) {
            FloatingActionButton(
                onClick = onCenterActionClick,
                containerColor = RoyalBluePrimary,
                contentColor = Color.White,
                shape = CircleShape,
                elevation = FloatingActionButtonDefaults.elevation(8.dp),
                modifier = Modifier.size(56.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.QrCodeScanner,
                    contentDescription = "Izin Pulang & QR Gerbang",
                    modifier = Modifier.size(28.dp)
                )
            }
        }
    }
}

@Composable
fun NavTabItem(
    label: String,
    icon: ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = if (isSelected) RoyalBluePrimary else TextMuted,
            modifier = Modifier.size(22.dp)
        )
        Text(
            text = label,
            color = if (isSelected) RoyalBluePrimary else TextMuted,
            fontSize = 10.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
        )
    }
}
