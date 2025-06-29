package com.example.aidoctor
import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.ViewTreeObserver
import android.view.WindowManager
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.aidoctor.db.ChatDatabaseHelper
import com.example.aidoctor.model.Message
import com.example.aidoctor.ui.theme.AIDoctorTheme
import com.example.aidoctor.utils.HttpUtils
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.Calendar

// 通知和日志
import addCalendarEvent;
import android.app.TimePickerDialog
import android.content.Context
import android.graphics.Rect
import android.provider.AlarmClock
import android.util.Log
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.window.Dialog
import com.example.aidoctor.utils.StreamingHttpUtils
import dev.jeziellago.compose.markdowntext.MarkdownText
import sendNotification;
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {
    private lateinit var dbHelper: ChatDatabaseHelper

    // 注册一个活动结果启动器来请求多个权限
    private val requestPermissionsLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            val allGranted = permissions.values.all { it }
            if (allGranted) {
                // 所有权限都已授予
            } else {
                // 部分或全部权限被拒绝
                Toast.makeText(this, "部分权限被拒绝，相关功能可能无法使用", Toast.LENGTH_SHORT).show()
            }
        }

    private fun askForPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        // Android 13+ 需要通知权限
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        // 日历权限
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_CALENDAR) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.WRITE_CALENDAR)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CALENDAR) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.READ_CALENDAR)
        }

        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionsLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        dbHelper = ChatDatabaseHelper(this)
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN)

        // 在设置内容之前请求所有需要的权限
        askForPermissions()

        enableEdgeToEdge()
        setContent {
            AIDoctorTheme {
                var showHistory by remember { mutableStateOf(false) }
                var currentSessionId by remember { mutableStateOf<Long?>(null) }

                if (showHistory) {
                    HistoryScreen(
                        onBackClick = { showHistory = false },
                        onSessionClick = { sessionId ->
                            currentSessionId = sessionId
                            showHistory = false
                        },
                        dbHelper = dbHelper
                    )
                } else {
                    ChatScreen(
                        dbHelper = dbHelper,
                        onHistoryClick = { showHistory = true },
                        currentSessionId = currentSessionId,
                        onNewSession = { sessionId ->
                            currentSessionId = sessionId
                        },
                        onShowHistoryChange = { showHistory = it }
                    )
                }
            }
        }
    }
}

@Composable
fun CalendarInputDialog(
    onConfirm: (title: String, description: String, location: String, startMillis: Long, remind: Int, duration: String) -> Unit,
    onDismiss: () -> Unit
) {
    // 表单字段状态
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("30") } // 默认持续时间30分钟
    var reminder by remember { mutableStateOf("10") } // 默认提前提醒10分钟
    var startMillis by remember { mutableStateOf(System.currentTimeMillis()) } // 开始时间
    var showDatePicker by remember { mutableStateOf(false) } // 控制是否显示日期选择器
    var showNativeTimePicker by remember { mutableStateOf(false) } // 控制时间选择器
    val calendar = Calendar.getInstance().apply { timeInMillis = startMillis }

    if (showDatePicker) {
        // 第一步：选择日期
        DatePickerDialog(
            initialDate = startMillis,
            onDateSelected = { selectedDate ->
                calendar.timeInMillis = selectedDate
                // 只更新日期，不立即提交完整时间
                val updatedCalendar = Calendar.getInstance().apply {
                    timeInMillis = selectedDate
                    set(Calendar.HOUR_OF_DAY, Calendar.getInstance().get(Calendar.HOUR_OF_DAY))
                    set(Calendar.MINUTE, Calendar.getInstance().get(Calendar.MINUTE))
                }
                startMillis = updatedCalendar.timeInMillis
                showNativeTimePicker = true // 立即打开时间选择器
                showDatePicker = false
            },
            onDismiss = { showDatePicker = false }
        )

    }
    // 第二步：选择时间
    if (showNativeTimePicker) {
        TimePickerDialog(
            context = LocalContext.current,
            initialHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY),
            initialMinute = Calendar.getInstance().get(Calendar.MINUTE),
            is24HourMode = true,
            onTimeSet = { hour, minute ->
                // 处理时间选择逻辑
                val calendar = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, hour)
                    set(Calendar.MINUTE, minute)
                }
                startMillis = calendar.timeInMillis
                showNativeTimePicker = false
            },
            onCancel = {
                showNativeTimePicker = false
            }
        )
    }


    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("设置提醒") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                // 标题输入框
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("标题") },
                    modifier = Modifier.fillMaxWidth()
                )

                // 描述输入框
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("描述") },
                    modifier = Modifier.fillMaxWidth()
                )

                // 地点输入框
                OutlinedTextField(
                    value = location,
                    onValueChange = { location = it },
                    label = { Text("地点") },
                    modifier = Modifier.fillMaxWidth()
                )
                // 格式化显示时间
                val dateTimeText = remember(startMillis) {
                    SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date(startMillis))
                }
                // 开始时间选择框
                OutlinedTextField(
                    value = dateTimeText,
                    onValueChange = {},
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp)),
                    readOnly = true,
                    trailingIcon = {
                        IconButton(onClick = { showDatePicker = true }) {
                            Icon(
                                imageVector = Icons.Default.DateRange,
                                contentDescription = "选择日期和时间"
                            )
                        }
                    },
                    label = { Text("开始时间") }
                )

                // 持续时间输入框
                OutlinedTextField(
                    value = duration,
                    onValueChange = { newValue ->
                        if (newValue.all { it.isDigit() }) duration = newValue
                    },
                    label = { Text("持续时间（分钟）") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )

                // 提前提醒输入框
                OutlinedTextField(
                    value = reminder,
                    onValueChange = { newValue ->
                        if (newValue.all { it.isDigit() }) reminder = newValue
                    },
                    label = { Text("提前提醒（分钟）") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                // 验证标题不为空后提交
                if (title.isNotBlank()) {
                    onConfirm(title, description, location, startMillis, reminder.toIntOrNull() ?: 5, duration)
                }
            }) {
                Text("确认")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        }
    )
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DatePickerDialog(
    initialDate: Long,
    onDateSelected:  (Long) -> Unit,
    onDismiss: () -> Unit
) {
    val datePickerState = rememberDatePickerState(initialSelectedDateMillis = initialDate)
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .widthIn(max = 400.dp)
                .padding(8.dp)
        ) {
            Column {
                DatePicker(state = datePickerState)
                Row(
                    modifier = Modifier.padding(8.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = {
                        if (datePickerState.selectedDateMillis != null) {
                            onDateSelected(datePickerState.selectedDateMillis!!)
                        }
                        onDismiss()
                    }) {
                        Text("确认")
                    }

                    TextButton(onClick = onDismiss) {
                        Text("取消")
                    }
                }
            }
        }
    }
}

@Composable
fun TimePickerDialog(
    context: Context,
    initialHour: Int,
    initialMinute: Int,
    is24HourMode: Boolean = true,
    onTimeSet: (hourOfDay: Int, minute: Int) -> Unit,
    onCancel: () -> Unit = {}
) {
    val dialog = remember(context, initialHour, initialMinute, is24HourMode) {
        TimePickerDialog(
            context,
            TimePickerDialog.OnTimeSetListener { _, hourOfDay, minute ->
                onTimeSet(hourOfDay, minute)
            },
            initialHour,
            initialMinute,
            is24HourMode
        )
    }

    DisposableEffect(dialog) {
        dialog.show()
        onDispose {
            dialog.dismiss()
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

        // 使用 MarkdownText 渲染消息内容，添加 fillMaxWidth 确保宽度撑满
        MarkdownText(
            markdown = message.content,
            modifier = Modifier
                .widthIn(max = 280.dp) // 限制最大宽度为屏幕宽度的70%
                .background(
                    color = if (message.isUser) Color(0xFF007DFF) else Color.White,
                    shape = RoundedCornerShape(10.dp)
                )
                .padding(10.dp),
            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = MaterialTheme.typography.bodyMedium.lineHeight * 1.2, color = if (message.isUser) Color.White else Color.Black) // 增加行高
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
fun ChatScreen(
    dbHelper: ChatDatabaseHelper,
    onHistoryClick: () -> Unit,
    currentSessionId: Long?,
    onNewSession: (Long) -> Unit,
    onShowHistoryChange: (Boolean) -> Unit
) {
    var messages by remember { mutableStateOf(listOf<Message>()) }
    var inputText by remember { mutableStateOf("") }
    var isTyping by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()
    val view = LocalView.current
    var isKeyboardOpen by remember { mutableStateOf(false) }
    val keyboardHeight = WindowInsets.ime.getBottom(LocalDensity.current)
    var showMenu by remember { mutableStateOf(false) }
    var showClearDialog by remember { mutableStateOf(false) }
    var showCalendarDialog by remember { mutableStateOf(false) }

    // 加载当前会话的消息
    LaunchedEffect(currentSessionId) {
        if (currentSessionId != null) {
            messages = dbHelper.getSessionMessages(currentSessionId)
            Log.i("MainActivity", "currentSessionId: $currentSessionId")
            Log.i("MainActivity", "messages: $messages")
        } else {
            messages = emptyList()
        }
    }

    // 监听键盘状态
    DisposableEffect(view) {
        val listener = ViewTreeObserver.OnGlobalLayoutListener {
            val rect = Rect()
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
                        onClick = { showMenu = true },
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
                        onClick = {
                            scope.launch {
                                try {
                                    val latestSessionId = dbHelper.getLatestSessionId()
                                    if (latestSessionId != null) {
                                        // 更新当前会话并关闭历史记录
                                        onNewSession(latestSessionId)
                                        onShowHistoryChange(false)

                                        // 添加预设消息
                                        val presetMessage = Message("你今天的症状如何？", false)
                                        dbHelper.saveMessage(latestSessionId, presetMessage)
                                        messages = messages + presetMessage
                                    }
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    val errorMessage = Message("操作失败，请稍后重试", false)
                                    if (currentSessionId != null) {
                                        try {
                                            dbHelper.saveMessage(currentSessionId, errorMessage)
                                        } catch (dbError: Exception) {
                                            dbError.printStackTrace()
                                        }
                                    }
                                }
                            }
                        },
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.sick),
                            contentDescription = "病情追踪",
                            modifier = Modifier.size(32.dp)
                        )
                    }
                    IconButton(
                        onClick = onHistoryClick,
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
                                    focusedBorderColor = Color.Black,
                                    unfocusedBorderColor = Color.Black
                                )
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(
                                onClick = {
//                                    sendNotification(view.context, "AIDoctor 提醒", "偷偷给你加了个30分钟后的日历哈哈哈哈");

                                    // 会g, 因为测试机器日历不行
//                                    val calendar = Calendar.getInstance()
//                                    val startMillis = calendar.timeInMillis + 60 * 1000 // 1分钟后
//                                    val endMillis = startMillis + 30 * 60 * 1000 // 持续30分钟
//
//                                    val eventId = addCalendarEvent(
//                                        context = view.context,
//                                        title = "AIDoctor 提醒",
//                                        description = "记得体验AI医生服务哦！",
//                                        location = "",
//                                        startMillis = startMillis,
//                                        endMillis = endMillis,
//                                        reminderMinutes = 1 // 提前1分钟提醒
//                                    )
//
//                                    if (eventId != null) {
//                                        Toast.makeText(view.context, "日历事件已添加", Toast.LENGTH_SHORT).show()
//                                    } else {
//                                        Toast.makeText(view.context, "添加日历事件失败，请检查权限", Toast.LENGTH_SHORT).show()
//                                    }



                                    if (inputText.trim().isNotEmpty()) {
                                        val userMessage = Message(inputText, true)
                                        inputText = ""
                                        isTyping = true

                                        scope.launch {
                                            try {
                                                val sessionId = currentSessionId ?: dbHelper.createNewSession("新对话")
                                                if (currentSessionId == null) {
                                                    onNewSession(sessionId)
                                                }

                                                if (messages.isEmpty()) {
                                                    dbHelper.updateSessionTitle(sessionId, userMessage.content.take(30))
                                                }

                                                dbHelper.saveMessage(sessionId, userMessage)
                                                messages = messages + userMessage

                                                val aiMessage = Message("", false)
                                                dbHelper.saveMessage(sessionId, aiMessage)
                                                var accumulatedResponse = ""
                                                messages = messages + aiMessage

                                                // 流式获取 AI 回复
                                                StreamingHttpUtils.streamMessage(sessionId, userMessage.content) { chunk ->
                                                    accumulatedResponse += chunk
                                                    val updatedMessages = messages.mapIndexed { index, message ->
                                                        if (index == messages.size - 1 && !message.isUser) {
                                                            message.copy(content = accumulatedResponse)
                                                        } else {
                                                            message
                                                        }
                                                    }
                                                    messages = updatedMessages
                                                }

                                                // 最终保存完整的回复到数据库
                                                dbHelper.updateMessageContent(sessionId, accumulatedResponse)

                                            } catch (e: Exception) {
                                                e.printStackTrace()
                                                val errorMessage = Message("发送消息失败，请稍后重试", false)
                                                if (currentSessionId != null) {
                                                    try {
                                                        dbHelper.saveMessage(currentSessionId, errorMessage)
                                                    } catch (dbError: Exception) {
                                                        dbError.printStackTrace()
                                                    }
                                                }
                                                messages = messages + errorMessage
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

    // 菜单对话框
    if (showMenu) {
        AlertDialog(
            onDismissRequest = { showMenu = false },
            title = { Text("菜单") },
            text = {
                Column {
                    ListItem(
                        headlineContent = { Text("返回首页") },
                        leadingContent = {
                            Icon(
                                imageVector = Icons.Default.Home,
                                contentDescription = "返回首页"
                            )
                        },
                        modifier = Modifier.clickable {
                            showMenu = false
                            onNewSession(-1L)  // 使用-1L表示返回首页
                        }
                    )
                    ListItem(
                        headlineContent = { Text("新建聊天") },
                        leadingContent = {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "新建聊天"
                            )
                        },
                        modifier = Modifier.clickable {
                            showMenu = false
                            scope.launch {
                                val sessionId = dbHelper.createNewSession("新对话")
                                onNewSession(sessionId)
                            }
                        }
                    )
                    ListItem(
                        headlineContent = { Text("清除当前对话") },
                        leadingContent = {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "清除对话"
                            )
                        },
                        modifier = Modifier.clickable {
                            showMenu = false
                            showClearDialog = true
                        }
                    )
                    ListItem(
                        headlineContent = { Text("设置") },
                        leadingContent = {
                            Icon(
                                imageVector = Icons.Default.Settings,
                                contentDescription = "设置"
                            )
                        },
                        modifier = Modifier.clickable {
                            showMenu = false
                            // TODO: 实现设置功能
                        }
                    )

                    ListItem(
                        headlineContent = { Text("打开系统时钟") },
                        modifier = Modifier.clickable {
                            showMenu = false
                            val context = view.context
                            val intent = Intent(AlarmClock.ACTION_SHOW_ALARMS)
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                            try {
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "未找到时钟应用", Toast.LENGTH_SHORT).show()
                            }
                        }
                    )

                    ListItem(
                        headlineContent = { Text("订阅日历") },
                        leadingContent = {
                            Icon(imageVector = Icons.Default.Add, contentDescription = "订阅日历")
                        },
                        modifier = Modifier.clickable {
                            showCalendarDialog = true
                        }
                    )

                    if (showCalendarDialog) {
                        CalendarInputDialog(
                            onConfirm = { title, desc, loc, startMillis, remind, duration ->
                                val durationMinutes = duration.toIntOrNull() ?: 30 // 默认30分钟
                                val endMillis = startMillis + durationMinutes * 60_000L
                                // 处理添加日历事件逻辑
                                val eventId = addCalendarEvent(
                                    context = view.context,
                                    title = title,
                                    description = desc,
                                    location = loc,
                                    startMillis = startMillis,
                                    endMillis = endMillis,
                                    reminderMinutes = remind
                                )
                                showCalendarDialog = false
                                if (eventId != null) {
                                    Toast.makeText(view.context, "设置成功", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(view.context, "添加失败，请检查权限", Toast.LENGTH_SHORT).show()
                                }
                            },
                            onDismiss = { showCalendarDialog = false }
                        )
                    }




                }
            },
            confirmButton = {
                TextButton(onClick = { showMenu = false }) {
                    Text("关闭")
                }
            }
        )
    }

    // 清除对话确认对话框
    if (showClearDialog) {
        AlertDialog(
            onDismissRequest = { showClearDialog = false },
            title = { Text("清除对话") },
            text = { Text("确定要清除当前对话吗？") },
            confirmButton = {
                TextButton(
                    onClick = {
                        scope.launch {
                            currentSessionId?.let { dbHelper.deleteSession(it) }
                            messages = emptyList()
                            showClearDialog = false
                        }
                    }
                ) {
                    Text("确定")
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearDialog = false }) {
                    Text("取消")
                }
            }
        )
    }
}