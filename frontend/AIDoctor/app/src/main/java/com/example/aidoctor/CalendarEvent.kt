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
    val calendarId = getAvailableCalendarId(context) ?: return null

    val values = ContentValues().apply {
        put(CalendarContract.Events.DTSTART, startMillis)
        put(CalendarContract.Events.DTEND, endMillis)
        put(CalendarContract.Events.TITLE, title)
        put(CalendarContract.Events.DESCRIPTION, description)
        put(CalendarContract.Events.CALENDAR_ID, calendarId)
        put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().id)
        put(CalendarContract.Events.EVENT_LOCATION, location)
        put(CalendarContract.Events.ALL_DAY, 0)
    }

    val uri = context.contentResolver.insert(CalendarContract.Events.CONTENT_URI, values)
    val eventId = uri?.lastPathSegment?.toLong()

    if (eventId != null && reminderMinutes > 0) {
        val reminderValues = ContentValues().apply {
            put(CalendarContract.Reminders.EVENT_ID, eventId)
            put(CalendarContract.Reminders.MINUTES, reminderMinutes)
            put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT)
        }
        context.contentResolver.insert(CalendarContract.Reminders.CONTENT_URI, reminderValues)
    }

    return eventId
}

private fun getAvailableCalendarId(context: Context): Long? {
    val projection = arrayOf(
        CalendarContract.Calendars._ID,
        CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL
    )

    context.contentResolver.query(
        CalendarContract.Calendars.CONTENT_URI,
        projection,
        null,
        null,
        null
    )?.use { cursor ->
        while (cursor.moveToNext()) {
            val calId = cursor.getLong(0)
            val accessLevel = cursor.getInt(1)
            if (accessLevel >= CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR) {
                return calId
            }
        }
    }

    return null
}

