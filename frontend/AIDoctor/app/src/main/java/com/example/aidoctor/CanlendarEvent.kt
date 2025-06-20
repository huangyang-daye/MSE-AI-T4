import android.content.ContentValues
import android.content.Context
import android.provider.CalendarContract
import java.util.TimeZone


fun addCalendarEvent(
    context: Context,
    title: String,
    description: String,
    location: String,
    startMillis: Long,
    endMillis: Long,
    reminderMinutes: Int = 10
): Long? {
    // 获取日历ID，通常为1（主日历），实际项目可查询日历表
    val calendarId: Long = 1

    val values = ContentValues().apply {
        put(CalendarContract.Events.DTSTART, startMillis)
        put(CalendarContract.Events.DTEND, endMillis)
        put(CalendarContract.Events.TITLE, title)
        put(CalendarContract.Events.DESCRIPTION, description)
        put(CalendarContract.Events.CALENDAR_ID, calendarId)
        put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().id)
        put(CalendarContract.Events.EVENT_LOCATION, location)
    }

    val uri = context.contentResolver.insert(CalendarContract.Events.CONTENT_URI, values)
    val eventId = uri?.lastPathSegment?.toLongOrNull()

    // 添加提醒
    if (eventId != null) {
        val reminderValues = ContentValues().apply {
            put(CalendarContract.Reminders.EVENT_ID, eventId)
            put(CalendarContract.Reminders.MINUTES, reminderMinutes)
            put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT)
        }
        context.contentResolver.insert(CalendarContract.Reminders.CONTENT_URI, reminderValues)
    }

    return eventId
}