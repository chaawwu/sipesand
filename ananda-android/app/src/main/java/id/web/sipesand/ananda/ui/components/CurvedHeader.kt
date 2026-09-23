package id.web.sipesand.ananda.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import id.web.sipesand.ananda.data.model.SantriData
import id.web.sipesand.ananda.ui.theme.*

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
    // Anti-AI: solid blue header, clean, no gradient, no glow, radius 0 top, 24 bottom
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(SolidRoyalBlue)
            .padding(start = 20.dp, end = 20.dp, top = 48.dp, bottom = 20.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Top Row: Greeting + Avatar + Notification
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AsyncImage(
                        model = "https://ui-avatars.com/api/?name=${waliName.replace(" ", "+")}&background=FFFFFF&color=1E3A8A&size=80&bold=true",
                        contentDescription = "Avatar Wali",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .border(2.dp, Color.White.copy(alpha = 0.9f), CircleShape)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Assalamu’alaikum,",
                            color = Color.White.copy(alpha = 0.85f),
                            fontSize = 12.sp,
                            fontFamily = InterFamily,
                            fontWeight = FontWeight.Normal
                        )
                        Text(
                            text = waliName,
                            color = Color.White,
                            fontSize = 16.sp,
                            fontFamily = PoppinsFamily,
                            fontWeight = FontWeight.Bold,
                            lineHeight = 18.sp
                        )
                        Text(
                            text = pesantrenName,
                            color = Color.White.copy(alpha = 0.75f),
                            fontSize = 11.sp,
                            fontFamily = InterFamily,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Box(contentAlignment = Alignment.TopEnd) {
                    IconButton(
                        onClick = onNotifClick,
                        modifier = Modifier
                            .size(40.dp)
                            .background(Color.White.copy(alpha = 0.14f), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "Notifikasi",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    if (unreadNotifCount > 0) {
                        Box(
                            modifier = Modifier
                                .offset(x = (-2).dp, y = 2.dp)
                                .size(9.dp)
                                .background(Color(0xFFEF4444), CircleShape)
                                .border(1.5.dp, SolidRoyalBlue, CircleShape)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Santri Card - white, radius 24, very soft shadow
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 1.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = santri?.photoUrl ?: "https://ui-avatars.com/api/?name=${(santri?.name ?: "Santri").replace(" ", "+")}&background=EFF6FF&color=1E3A8A&size=100",
                        contentDescription = "Foto Santri",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .border(1.dp, BorderColor, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = santri?.name ?: "Santri SiPesand",
                            color = TextPrimary,
                            fontSize = 14.sp,
                            fontFamily = PoppinsFamily,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1
                        )
                        Text(
                            text = "NIS ${santri?.nis ?: "-"} • ${santri?.kelas ?: "Kelas Santri"}",
                            color = TextSecondary,
                            fontSize = 11.sp,
                            fontFamily = InterFamily
                        )
                        Text(
                            text = santri?.musyrifName ?: "Musyrif Asrama",
                            color = TextMuted,
                            fontSize = 11.sp,
                            fontFamily = InterFamily
                        )
                    }
                    Surface(
                        color = if (santri?.status == "Aktif") Color(0xFFDEF7EC) else Color(0xFFFEF3C7),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = santri?.status ?: "Aktif",
                            color = if (santri?.status == "Aktif") Color(0xFF03543F) else Color(0xFF92400E),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = InterFamily,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Search bar - white, radius 24, height 44, soft shadow
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 1.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Cari",
                        tint = TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Box(modifier = Modifier.weight(1f)) {
                        if (searchQuery.isEmpty()) {
                            Text(
                                text = "Cari menu, tagihan, guru...",
                                color = TextMuted,
                                fontSize = 13.sp,
                                fontFamily = InterFamily
                            )
                        }
                        androidx.compose.foundation.text.BasicTextField(
                            value = searchQuery,
                            onValueChange = onSearchChange,
                            singleLine = true,
                            textStyle = androidx.compose.ui.text.TextStyle(
                                color = TextPrimary,
                                fontSize = 13.sp,
                                fontFamily = InterFamily
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}
