package id.web.sipesand.ananda.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.GenericShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import id.web.sipesand.ananda.data.model.SantriData
import id.web.sipesand.ananda.ui.theme.*

// Custom Curved Bottom Shape for Signature Header (faithful to reference images)
val CurvedBottomShape = GenericShape { size, _ ->
    val width = size.width
    val height = size.height
    moveTo(0f, 0f)
    lineTo(width, 0f)
    lineTo(width, height - 36f)
    quadraticBezierTo(
        width / 2f, height + 16f,
        0f, height - 36f
    )
    close()
}

@Composable
fun CurvedHeader(
    waliName: String,
    pesantrenName: String,
    santri: SantriData?,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    unreadNotifCount: Int = 0,
    onNotifClick: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(CurvedBottomShape)
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(RoyalBlueDark, RoyalBluePrimary)
                )
            )
            .padding(start = 20.dp, end = 20.dp, top = 44.dp, bottom = 42.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Top Row: Greeting & Notifications
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Assalamu’alaikum,",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Normal
                    )
                    Text(
                        text = waliName,
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = pesantrenName,
                        color = Color(0xFF93C5FD),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                // Notification Bell Icon with Badge
                Box(
                    contentAlignment = Alignment.TopEnd
                ) {
                    IconButton(
                        onClick = onNotifClick,
                        modifier = Modifier
                            .size(44.dp)
                            .background(Color.White.copy(alpha = 0.15f), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "Notifikasi",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    if (unreadNotifCount > 0) {
                        Box(
                            modifier = Modifier
                                .offset(x = (-2).dp, y = 2.dp)
                                .size(10.dp)
                                .background(Color(0xFFEF4444), CircleShape)
                                .border(1.5.dp, RoyalBlueDark, CircleShape)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Santri Profile Row (Avatar + NIS + Class)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(16.dp))
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Santri Avatar
                AsyncImage(
                    model = santri?.photoUrl ?: "https://ui-avatars.com/api/?name=${santri?.name ?: "Santri"}&background=FFFFFF&color=07266E",
                    contentDescription = "Foto Santri",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color.White, CircleShape)
                )

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = santri?.name ?: "Santri SiPesand",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "NIS: ${santri?.nis ?: "-"} • ${santri?.kelas ?: "Kelas Santri"}",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 12.sp
                    )
                    Text(
                        text = "Musyrif: ${santri?.musyrifName ?: "Ust. Rahmat Hidayat"}",
                        color = Color(0xFFBFDBFE),
                        fontSize = 11.sp
                    )
                }

                // Status Pill
                Surface(
                    color = if (santri?.status == "Aktif") Color(0xFF16A34A) else Color(0xFFD97706),
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text(
                        text = santri?.status ?: "Aktif",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Integrated Search Bar (Exactly as shown in reference images)
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 3.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Cari",
                        tint = TextSecondary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Box(modifier = Modifier.weight(1f)) {
                        if (searchQuery.isEmpty()) {
                            Text(
                                text = "Cari menu, tagihan, guru, nilai...",
                                color = TextMuted,
                                fontSize = 13.sp
                            )
                        }
                        androidx.compose.foundation.text.BasicTextField(
                            value = searchQuery,
                            onValueChange = onSearchChange,
                            singleLine = true,
                            textStyle = androidx.compose.ui.text.TextStyle(
                                color = TextPrimary,
                                fontSize = 13.sp
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}
