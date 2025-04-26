package com.example.aidoctor

import android.os.Bundle
import android.view.ViewTreeObserver
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.layout.WindowInsets
import com.example.aidoctor.ui.theme.AIDoctorTheme
import com.example.aidoctor.utils.HttpUtils
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.delay
import androidx.compose.ui.platform.LocalDensity

data class Message(
    val content: String,
    val isUser: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN)
        enableEdgeToEdge()
        setContent {
            AIDoctorTheme {
                ChatScreen()
            }
        }
    }
}

@Composable
fun MessageBubble(
    message: Message,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Top
    ) {
        if (!message.isUser) {
            // 医生头像
            Image(
                painter = painterResource(id = R.drawable.doctor_avatar),
                contentDescription = "医生头像",
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
            )
            Spacer(modifier = Modifier.width(8.dp))
        }

        Text(
            text = message.content,
            modifier = Modifier
                .widthIn(max = 280.dp) // 限制最大宽度为屏幕宽度的70%
                .background(
                    color = if (message.isUser) Color(0xFF007DFF) else Color.White,
                    shape = RoundedCornerShape(10.dp)
                )
                .padding(10.dp),
            color = if (message.isUser) Color.White else Color.Black,
            fontSize = 16.sp
        )

        if (message.isUser) {
            Spacer(modifier = Modifier.width(8.dp))
            // 用户头像
            Image(
                painter = painterResource(id = R.drawable.user_avatar),
                contentDescription = "用户头像",
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen() {
    var messages by remember { mutableStateOf(listOf<Message>()) }
    var inputText by remember { mutableStateOf("") }
    var isTyping by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()
    val view = LocalView.current
    var isKeyboardOpen by remember { mutableStateOf(false) }
    val keyboardHeight = WindowInsets.ime.getBottom(LocalDensity.current)

    // 监听键盘状态
    DisposableEffect(view) {
        val listener = ViewTreeObserver.OnGlobalLayoutListener {
            val rect = android.graphics.Rect()
            view.getWindowVisibleDisplayFrame(rect)
            val screenHeight = view.rootView.height
            val keypadHeight = screenHeight - rect.bottom
            isKeyboardOpen = keypadHeight > screenHeight * 0.15
        }
        view.viewTreeObserver.addOnGlobalLayoutListener(listener)
        onDispose {
            view.viewTreeObserver.removeOnGlobalLayoutListener(listener)
        }
    }

    // 自动滚动到底部
    LaunchedEffect(messages.size, keyboardHeight) {
        if (messages.isNotEmpty()) {
            // 减少延迟时间并使用更快的滚动方式
            delay(40)
            listState.scrollToItem(messages.size - 1)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
            .imePadding()
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // 顶部导航栏
            TopAppBar(
                title = {
                    Text(
                        "AIDoctor",
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = { /* TODO: 添加菜单功能 */ },
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.menu),
                            contentDescription = "菜单",
                            modifier = Modifier.size(32.dp)
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = { /* TODO: 添加历史记录功能 */ },
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.history),
                            contentDescription = "历史记录",
                            modifier = Modifier.size(32.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )

            // 聊天区域和输入区域
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.fillMaxSize()
                ) {
                    // 聊天区域
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(messages) { message ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
                            ) {
                                MessageBubble(message = message)
                            }
                        }
                    }

                    // 底部输入区域
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Color.White,
                        shadowElevation = 4.dp
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                                .height(60.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            OutlinedTextField(
                                value = inputText,
                                onValueChange = { inputText = it },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(60.dp),
                                placeholder = { Text("请输入您的问题...") },
                                shape = RoundedCornerShape(24.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Color.Transparent,
                                    unfocusedBorderColor = Color.Transparent
                                )
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(
                                onClick = {
                                    if (inputText.trim().isNotEmpty()) {
                                        messages = messages + Message(inputText, true)
                                        val userMessage = inputText
                                        inputText = ""
                                        isTyping = true

                                        scope.launch {
                                            try {
                                                val response = HttpUtils.sendMessage(userMessage)
                                                messages = messages + Message(response, false)
                                            } catch (e: Exception) {
                                                messages = messages + Message("发送消息失败，请稍后重试", false)
                                            } finally {
                                                isTyping = false
                                            }
                                        }
                                    }
                                },
                                enabled = !isTyping,
                                modifier = Modifier
                                    .width(77.dp)
                                    .height(48.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF007DFF)
                                )
                            ) {
                                Text(
                                    "发送",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}