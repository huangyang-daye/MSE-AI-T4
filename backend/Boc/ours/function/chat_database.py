import logging

log = logging.getLogger(__name__)
import sqlite3
from datetime import datetime
import os

DATABASE_NAME = "chat_history.db"

class ChatDatabaseHelper:
    def __init__(self, db_path=DATABASE_NAME):
        self.db_path = db_path
        self._initialize_db()

    def _initialize_db(self):
        """创建数据库和表"""
        with self._connect() as conn:
            cursor = conn.cursor()
            self._create_tables(cursor)

    def _connect(self):
        """连接数据库"""
        return sqlite3.connect(self.db_path)

    def _create_tables(self, cursor):
        """创建 sessions 和 messages 表"""
        try:
            print("[INFO] 正在创建数据库表...")

            # 创建 sessions 表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    timestamp INTEGER
                )
            """)
            print("[INFO] sessions 表已创建")

            # 创建 messages 表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id INTEGER,
                    content TEXT,
                    timestamp INTEGER,
                    is_user INTEGER,
                    FOREIGN KEY (session_id) REFERENCES sessions(id)
                )
            """)
            print("[INFO] messages 表已创建")

        except Exception as e:
            print(f"[ERROR] 创建数据库表时出错: {e}")
            raise e

    def create_new_session(self, title: str) -> int:
        """创建一个新的会话"""
        timestamp = int(datetime.now().timestamp() * 1000)
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sessions (title, timestamp)
                VALUES (?, ?)
            """, (title, timestamp))
            conn.commit()
            return cursor.lastrowid

    def update_session_title(self, session_id: int, new_title: str):
        """更新会话标题"""
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE sessions
                SET title = ?
                WHERE id = ?
            """, (new_title, session_id))
            conn.commit()
            if cursor.rowcount == 0:
                raise Exception("Failed to update session title")

    def get_all_sessions(self) -> list:
        """获取所有会话"""
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, timestamp FROM sessions ORDER BY timestamp DESC")
            rows = cursor.fetchall()
            return [{"id": row[0], "title": row[1], "timestamp": row[2]} for row in rows]

    def delete_session(self, session_id: int):
        """删除指定会话及其所有消息"""
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
            conn.commit()

    def clear_all_history(self):
        """清空所有数据"""
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages")
            cursor.execute("DELETE FROM sessions")
            conn.commit()

    def save_message(self, session_id: int, message_content: str, is_user: bool):
        """保存一条消息"""
        timestamp = int(datetime.now().timestamp() * 1000)  # 毫秒时间戳
        log.info(f"Saving message for session {session_id}: {message_content} (is_user={is_user})")
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO messages (session_id, content, timestamp, is_user)
                VALUES (?, ?, ?, ?)
            """, (session_id, message_content, timestamp, 1 if is_user else 0))
            conn.commit()

    def get_session_messages(self, session_id: int) -> list:
        """获取某个会话的所有消息"""
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT content, is_user FROM messages
                WHERE session_id = ?
                ORDER BY timestamp ASC
            """, (session_id,))
            rows = cursor.fetchall()
            return [{"content": row[0], "is_user": bool(row[1])} for row in rows]
    
    def session_exists(self, session_id):
        """判断指定的 session 是否在 messages 表中已有消息"""
        with self._connect() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT 1 FROM messages WHERE session_id = ?', (session_id,))
            return cursor.fetchone() is not None