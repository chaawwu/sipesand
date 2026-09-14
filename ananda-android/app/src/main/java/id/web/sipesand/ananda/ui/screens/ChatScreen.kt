package id.web.sipesand.ananda.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import id.web.sipesand.ananda.data.model.ChatMessageItem
import id.web.sipesand.ananda.data.model.ChatRoomItem
import id.web.sipesand.ananda.data.repository.AnandaRepository
import id.web.sipesand.ananda.ui.components.BottomNavBar
import id.web.sipesand.ananda.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val repository = remember { AnandaRepository() }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    var activeRoom by remember { mutableStateOf<ChatRoomItem?>(null) }
    var chatRooms by remember { mutableStateOf<List<ChatRoomItem>>(emptyList()) }
    var messages by remember { mutableStateOf<List<ChatMessageItem>>(emptyList()) }
    var inputMessage by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(key1 = true) {
        scope.launch {
            isLoading = true
            val roomsRes = repository.getChatRooms()
            chatRooms = roomsRes.getOrNull() ?: emptyList()
            if (chatRooms.isNotEmpty()) {
                activeRoom = chatRooms[0]
                val msgRes = repository.getChatMessages(chatRooms[0].id)
                messages = msgRes.getOrNull()?.messages ?: emptyList()
            }
            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(
                            model = activeRoom?.targetAvatar ?: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                            contentDescription = null,
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = activeRoom?.targetName ?: "Musyrif Asrama",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Online • Menjawab pesan",
                                fontSize = 11.sp,
                                color = Color(0xFF86EFAC)
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { onNavigate("dashboard") }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Kembali", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = RoyalBlueDark)
            )
        },
        bottomBar = {
            // Chat Input Bar
            Surface(
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = {
                        Toast.makeText(context, "Pilih lampiran dokumen/foto", Toast.LENGTH_SHORT).show()
                    }) {
                        Icon(Icons.Outlined.AttachFile, contentDescription = "Lampiran", tint = TextSecondary)
                    }

                    Surface(
                        color = SurfaceBackground,
                        shape = RoundedCornerShape(24.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Box(
                            contentAlignment = Alignment.CenterStart,
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 14.dp)
                        ) {
                            if (inputMessage.isEmpty()) {
                                Text("Tulis pesan ke musyrif...", fontSize = 13.sp, color = TextMuted)
                            }
                            androidx.compose.foundation.text.BasicTextField(
                                value = inputMessage,
                                onValueChange = { inputMessage = it },
                                singleLine = false,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    if (inputMessage.isBlank()) {
                        IconButton(
                            onClick = {
                                Toast.makeText(context, "Merekam Voice Note...", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier
                                .size(44.dp)
                                .background(RoyalBluePrimary, CircleShape)
                        ) {
                            Icon(Icons.Outlined.Mic, contentDescription = "Voice Note", tint = Color.White)
                        }
                    } else {
                        IconButton(
                            onClick = {
                                val text = inputMessage
                                inputMessage = ""
                                scope.launch {
                                    activeRoom?.let { room ->
                                        val sendRes = repository.sendMessage(room.id, text)
                                        sendRes.getOrNull()?.let { newMsg ->
                                            messages = messages + newMsg
                                            listState.animateScrollToItem(messages.size - 1)
                                        }
                                    }
                                }
                            },
                            modifier = Modifier
                                .size(44.dp)
                                .background(RoyalBluePrimary, CircleShape)
                        ) {
                            Icon(Icons.Default.Send, contentDescription = "Kirim", tint = Color.White)
                        }
                    }
                }
            }
        },
        containerColor = Color(0xFFF1F5F9)
    ) { paddingValues ->
        LazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(messages) { msg ->
                val isMe = msg.senderType == "wali"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isMe) Arrangement.End else Arrangement.Start
                ) {
                    Surface(
                        shape = RoundedCornerShape(
                            topStart = 16.dp,
                            topEnd = 16.dp,
                            bottomStart = if (isMe) 16.dp else 2.dp,
                            bottomEnd = if (isMe) 2.dp else 16.dp
                        ),
                        color = if (isMe) Color(0xFFDCF8C6) else Color.White,
                        shadowElevation = 1.dp,
                        modifier = Modifier.widthIn(max = 280.dp)
                    ) {
                        Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                            Text(
                                text = msg.message ?: "",
                                fontSize = 14.sp,
                                color = TextPrimary
                            )
                            Row(
                                modifier = Modifier
                                    .align(Alignment.End)
                                    .padding(top = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = msg.createdAt ?: "10:45",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                                if (isMe) {
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(
                                        imageVector = Icons.Default.DoneAll,
                                        contentDescription = "Dibaca",
                                        tint = if (msg.isRead) Color(0xFF38BDF8) else TextMuted,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
