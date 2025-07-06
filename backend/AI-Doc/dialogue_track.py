from flask import Blueprint, request, Response, jsonify
from datetime import datetime
from openai import OpenAI
import logging
from chat_database import ChatDatabaseHelper

logger = logging.getLogger(__name__)
track_bp = Blueprint('track', __name__)

client = OpenAI(
    api_key="sk-qopksyugdcrdnafcehrtuvjfpqpnkkznzagihikhcwsnyinj",
    base_url="https://api.siliconflow.cn/v1"
)

db_helper = ChatDatabaseHelper()
session_states = {}

def generate_stream(session_id, user_query, context):
    try:
        name = '医疗问诊助手'
        role = '结合历史对话，通过对话引导用户描述症状，收集相关信息，并提供初步的诊疗建议'
        full_prompt = f"""
        你是一个专业的{name},你的任务是 {role}。
        请遵循以下原则：
        1. 一步一步引导用户，每次只问一个问题
        2. 使用简单易懂的语言，避免过多专业术语
        3. 对用户的回答表示理解和共情
        4. 不要做出确定的诊断，只提供可能的情况和建议
        5. 对于严重症状，建议用户及时就医
        6. 保持专业、耐心和友好的态度
        对话历史：
        {context}
        用户现在说：
        "{user_query}"
        请基于以上内容给出专业建议
        """

        response = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-V2.5",
            messages=[
                {"role": "system", "content": full_prompt},
                {"role": "user", "content": user_query}
            ],
            stream=True,
            temperature=1,
            presence_penalty=0,
            frequency_penalty=0,
            max_tokens=2000
        )

        bot_reply = ""
        for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                content = content.replace("\n", "<br>")
                bot_reply += content
                yield f"data: {content}\n\n"  # 按照 EventStream 格式发送每一块

        # 更新 session_states 缓存
        new_context = context + f"\nUser: {user_query}\nAI: {bot_reply}"
        session_states[session_id]["context"] = new_context

        now = datetime.now()
        session_states[session_id]["last_active_time"] = now

        last_saved_time = session_states[session_id].get("last_saved_time", None)
        should_auto_save = last_saved_time is None or (now - last_saved_time).total_seconds() >= 10

        if should_auto_save:
            try:
                db_helper.save_message(session_id, user_query, is_user=True)
                db_helper.save_message(session_id, bot_reply, is_user=False)
                session_states[session_id]["last_saved_time"] = now
                
                logger.info(f"已自动保存 session {session_id} 到数据库")
            except Exception as e:
                logger.error(f"保存 session {session_id} 到数据库时出错: {str(e)}", exc_info=True)

    except Exception as e:
        logger.error(f"调用大模型时出错: {str(e)}", exc_info=True)
        yield f"data: [错误] 内部服务器错误\n\n"

@track_bp.route("/get", methods=["POST"])
def analyze_session():
    data = request.get_json()
    user_query = data.get("msg") or ""
    session_id = data.get("session_id", "default_session")

    logger.info(f"[{datetime.now()}] 收到分析请求")
    logger.debug(f"用户问题: {user_query}")

    if not user_query:
        return jsonify({"error": "Missing 'msg' in request"}), 400

    try:
        now = datetime.now()

        if session_id not in session_states:
            if db_helper.session_exists(session_id):
                messages = db_helper.get_session_messages(session_id)
                context = "\n".join([f"User: {msg['content']}" if msg['is_user'] else f"AI: {msg['content']}" for msg in messages])
            else:
                context = ""
            session_states[session_id] = {
                "context": context,
                "last_active_time": now,
                "last_saved_time": None
            }
        else:
            context = session_states[session_id]["context"]
            session_states[session_id]["last_active_time"] = now

        return Response(generate_stream(session_id, user_query, context), mimetype='text/event-stream')

    except Exception as e:
        logger.error(f"调用大模型时出错: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500