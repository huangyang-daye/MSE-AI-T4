package com.example.aidoctor.db

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log
import com.example.aidoctor.model.Message
import java.util.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class ChatSession(
    val id: Long,
    val title: String,
    val timestamp: Long
)

class ChatDatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_NAME = "chat_history.db"
        private const val DATABASE_VERSION = 1
        private const val TABLE_SESSIONS = "sessions"
        private const val TABLE_MESSAGES = "messages"
        private const val COLUMN_ID = "id"
        private const val COLUMN_SESSION_ID = "session_id"
        private const val COLUMN_TITLE = "title"
        private const val COLUMN_TIMESTAMP = "timestamp"
        private const val COLUMN_CONTENT = "content"
        private const val COLUMN_IS_USER = "is_user"
    }

    init {
        // 强制创建数据库
        val db = writableDatabase
        try {
            onCreate(db)
        } finally {
            db.close()
        }
    }
    suspend fun updateMessageContent(messageId: Long, newContent: String) = withContext(Dispatchers.IO) {
        try {
            val database = writableDatabase
            val values = ContentValues().apply {
                put(COLUMN_CONTENT, newContent)
            }
    
            val rowsAffected = database.update(
                TABLE_MESSAGES,
                values,
                "$COLUMN_ID = ?",
                arrayOf(messageId.toString())
            )
    
            if (rowsAffected == 0) {
                throw Exception("Failed to update message with ID: $messageId")
            }
    
            Log.d("ChatDatabaseHelper", "Message with ID $messageId updated successfully")
    
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error updating message content", e)
            throw e
        }
    }

    override fun onCreate(db: SQLiteDatabase) {
        try {
            Log.d("ChatDatabaseHelper", "Creating database tables...")
            
            // 创建会话表
            val createSessionsTable = """
                CREATE TABLE IF NOT EXISTS $TABLE_SESSIONS (
                    $COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                    $COLUMN_TITLE TEXT,
                    $COLUMN_TIMESTAMP INTEGER
                )
            """.trimIndent()
            db.execSQL(createSessionsTable)
            Log.d("ChatDatabaseHelper", "Sessions table created successfully")

            // 创建消息表
            val createMessagesTable = """
                CREATE TABLE IF NOT EXISTS $TABLE_MESSAGES (
                    $COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                    $COLUMN_SESSION_ID INTEGER,
                    $COLUMN_CONTENT TEXT,
                    $COLUMN_TIMESTAMP INTEGER,
                    $COLUMN_IS_USER INTEGER,
                    FOREIGN KEY ($COLUMN_SESSION_ID) REFERENCES $TABLE_SESSIONS($COLUMN_ID)
                )
            """.trimIndent()
            db.execSQL(createMessagesTable)
            Log.d("ChatDatabaseHelper", "Messages table created successfully")
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error creating database tables", e)
            throw e
        }
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        try {
            Log.d("ChatDatabaseHelper", "Upgrading database from version $oldVersion to $newVersion")
            db.execSQL("DROP TABLE IF EXISTS $TABLE_MESSAGES")
            db.execSQL("DROP TABLE IF EXISTS $TABLE_SESSIONS")
            onCreate(db)
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error upgrading database", e)
            throw e
        }
    }

    suspend fun createNewSession(title: String): Long = withContext(Dispatchers.IO) {
        val db = writableDatabase
        try {
            val values = ContentValues().apply {
                put(COLUMN_TITLE, title)
                put(COLUMN_TIMESTAMP, System.currentTimeMillis())
            }
            val id = db.insert(TABLE_SESSIONS, null, values)
            if (id == -1L) {
                throw Exception("Failed to create new session")
            }
            id
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error creating new session", e)
            throw e
        }
    }

    suspend fun saveMessage(sessionId: Long, message: Message) = withContext(Dispatchers.IO) {
        val db = writableDatabase
        try {
            val values = ContentValues().apply {
                put(COLUMN_SESSION_ID, sessionId)
                put(COLUMN_TIMESTAMP, System.currentTimeMillis())
                put(COLUMN_CONTENT, message.content)
                put(COLUMN_IS_USER, if (message.isUser) 1 else 0)
            }
            val id = db.insert(TABLE_MESSAGES, null, values)
            if (id == -1L) {
                throw Exception("Failed to save message")
            }
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error saving message", e)
            throw e
        }
    }

    suspend fun getAllSessions(): List<ChatSession> = withContext(Dispatchers.IO) {
        val sessions = mutableListOf<ChatSession>()
        val db = readableDatabase
        try {
            val cursor = db.query(
                TABLE_SESSIONS,
                null,
                null,
                null,
                null,
                null,
                "$COLUMN_TIMESTAMP DESC"
            )

            cursor.use {
                while (it.moveToNext()) {
                    val id = it.getLong(it.getColumnIndexOrThrow(COLUMN_ID))
                    val title = it.getString(it.getColumnIndexOrThrow(COLUMN_TITLE))
                    val timestamp = it.getLong(it.getColumnIndexOrThrow(COLUMN_TIMESTAMP))
                    sessions.add(ChatSession(id, title, timestamp))
                }
            }
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error getting all sessions", e)
            throw e
        }
        sessions
    }

    suspend fun getSessionMessages(sessionId: Long): List<Message> = withContext(Dispatchers.IO) {
        val messages = mutableListOf<Message>()
        val db = readableDatabase
        try {
            val cursor = db.query(
                TABLE_MESSAGES,
                null,
                "$COLUMN_SESSION_ID = ?",
                arrayOf(sessionId.toString()),
                null,
                null,
                "$COLUMN_TIMESTAMP ASC"
            )

            cursor.use {
                while (it.moveToNext()) {
                    val content = it.getString(it.getColumnIndexOrThrow(COLUMN_CONTENT))
                    val isUser = it.getInt(it.getColumnIndexOrThrow(COLUMN_IS_USER)) == 1
                    messages.add(Message(content, isUser))
                }
            }
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error getting session messages", e)
            throw e
        }
        messages
    }

    suspend fun deleteSession(sessionId: Long) = withContext(Dispatchers.IO) {
        val db = writableDatabase
        try {
            db.beginTransaction()
            try {
                db.delete(TABLE_MESSAGES, "$COLUMN_SESSION_ID = ?", arrayOf(sessionId.toString()))
                db.delete(TABLE_SESSIONS, "$COLUMN_ID = ?", arrayOf(sessionId.toString()))
                db.setTransactionSuccessful()
            } finally {
                db.endTransaction()
            }
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error deleting session", e)
            throw e
        }
    }

    suspend fun clearAllHistory() = withContext(Dispatchers.IO) {
        val db = writableDatabase
        try {
            db.beginTransaction()
            try {
                db.delete(TABLE_MESSAGES, null, null)
                db.delete(TABLE_SESSIONS, null, null)
                db.setTransactionSuccessful()
            } finally {
                db.endTransaction()
            }
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error clearing history", e)
            throw e
        }
    }

    suspend fun updateSessionTitle(sessionId: Long, newTitle: String) = withContext(Dispatchers.IO) {
        val db = writableDatabase
        try {
            val values = ContentValues().apply {
                put(COLUMN_TITLE, newTitle)
            }
            val rowsAffected = db.update(
                TABLE_SESSIONS,
                values,
                "$COLUMN_ID = ?",
                arrayOf(sessionId.toString())
            )
            if (rowsAffected == 0) {
                throw Exception("Failed to update session title")
            }
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error updating session title", e)
            throw e
        }
    }

    fun getLatestSessionId(): Long? {
        var sessionId: Long? = null
        try {
            val db = this.readableDatabase
            val cursor = db.query(
                TABLE_SESSIONS,
                arrayOf(COLUMN_ID),
                null,
                null,
                null,
                null,
                "$COLUMN_ID DESC",
                "1"
            )
            if (cursor.moveToFirst()) {
                sessionId = cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ID))
            }
            cursor.close()
        } catch (e: Exception) {
            Log.e("ChatDatabaseHelper", "Error getting latest session ID", e)
            e.printStackTrace()
        }
        return sessionId
    }

    fun deleteLastMessage(sessionId: Long) {
        val db = this.writableDatabase
        try {
            // 获取最后一条消息的ID
            val cursor = db.query(
                TABLE_MESSAGES,
                arrayOf("id"),
                "session_id = ?",
                arrayOf(sessionId.toString()),
                null,
                null,
                "id DESC",
                "1"
            )

            if (cursor.moveToFirst()) {
                val messageId = cursor.getLong(0)
                // 删除该消息
                db.delete(
                    TABLE_MESSAGES,
                    "id = ?",
                    arrayOf(messageId.toString())
                )
            }
            cursor.close()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun updateLastMessage(sessionId: Long, newMessage: Message) {
        val db = this.writableDatabase
        try {
            // 获取最后一条消息的ID
            val cursor = db.query(
                TABLE_MESSAGES,
                arrayOf("id"),
                "session_id = ?",
                arrayOf(sessionId.toString()),
                null,
                null,
                "id DESC",
                "1"
            )

            if (cursor.moveToFirst()) {
                val messageId = cursor.getLong(0)
                // 更新该消息
                val values = ContentValues().apply {
                    put("content", newMessage.content)
                    put("is_user", if (newMessage.isUser) 1 else 0)
                }
                db.update(
                    TABLE_MESSAGES,
                    values,
                    "id = ?",
                    arrayOf(messageId.toString())
                )
            }
            cursor.close()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
} 