import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.aidoctor.R

// 定义通知渠道 ID 和通知 ID
private const val CHANNEL_ID = "aidoctor_notification_channel"
private const val NOTIFICATION_ID = 1

/**
 * 显示一个应用内通知。
 *
 * @param context 上下文
 * @param title 通知标题
 * @param description 通知内容
 */
fun sendNotification(context: Context, title: String, description: String) {
    val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    // 对于 Android 8.0 (API 26) 及以上版本，必须创建通知渠道
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "App Notifications", // 用户在系统设置中看到的渠道名称
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            this.description = "Channel for app notifications" // 渠道描述
        }
        notificationManager.createNotificationChannel(channel)
    }

    // 构建通知
    val builder = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(R.drawable.ic_launcher_foreground) // **重要**: 请将此图标替换为您自己的通知图标
        .setContentTitle(title)
        .setContentText(description)
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setAutoCancel(true) // 用户点击后自动移除通知

    // 发送通知
    notificationManager.notify(NOTIFICATION_ID, builder.build())
}