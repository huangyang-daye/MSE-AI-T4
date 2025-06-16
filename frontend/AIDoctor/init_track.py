from flask import Blueprint, request, jsonify
from datetime import datetime
from openai import OpenAI
import logging
from chat_database import ChatDatabaseHelper  # 引入数据库帮助类

# 初始化日志
logger = logging.getLogger(__name__)

# 创建蓝图
track_bp = Blueprint('track', __name__)

# 初始化模型客户端
client = OpenAI(
    api_key="sk-qopksyugdcrdnafcehrtuvjfpqpnkkznzagihikhcwsnyinj",
    base_url="https://api.siliconflow.cn/v1"
)

# 实例化数据库帮助类
db_helper = ChatDatabaseHelper()

session_states = {}

@track_bp.route("/get", methods=["POST"])
def analyze_session():
    data = request.get_json()
    user_query = data.get("msg") or ""
    session_id = data.get("session_id", "default_session")

    logger.info(f"[{datetime.now()}] 收到分析请求")
    logger.debug(f"用户问题: {user_query}")

    if not user_query:
        logger.warning("缺少必要参数 msg")
        return jsonify({"error": "Missing 'msg' in request"}), 400

    try:
        now = datetime.now()

        # 更新 session_states 缓存
        if session_id not in session_states:
            
            # 判断 session_id 是否存在于数据库中
            if db_helper.session_exists(session_id):
                # 如果存在，从数据库加载历史消息
                messages = db_helper.get_session_messages(session_id)
                context = "\n".join([f"User: {msg['content']}" if msg['is_user'] else f"AI: {msg['content']}" for msg in messages])
                logger.info(f"初始化 session {session_id}，从数据库加载上下文")
            else:
                # 如果不存在，创建新的 session
                context = ""  # 新 session 的初始上下文为空
                logger.info(f"创建新的 session {session_id}")
                
            session_states[session_id] = {
                "context": context,
                "last_active_time": now,
                "last_saved_time": None
            }
        else:
            context  = session_states[session_id]["context"]
            session_states[session_id]["last_active_time"] = now

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
            temperature=1,
            presence_penalty=0,
            frequency_penalty=0,
            max_tokens=2000
        )

        bot_reply = response.choices[0].message.content.strip()
        logger.info(f"AI 返回结果: {bot_reply[:100]}...")

        new_context = session_states[session_id]["context"] + f"\nUser: {user_query}\nAI: {bot_reply}"
        session_states[session_id]["context"] = new_context
        session_states[session_id]["last_active_time"] = now

        last_saved_time = session_states[session_id].get("last_saved_time", None)

        should_auto_save = False
        if last_saved_time is None:
            should_auto_save = False
        else:
            time_diff = (now - last_saved_time).total_seconds()
            if time_diff >= 300:
                should_auto_save = True

        if should_auto_save:
            db_helper.save_message(session_id, user_query, is_user=True)
            db_helper.save_message(session_id, bot_reply, is_user=False)
            session_states[session_id]["last_saved_time"] = now
            logger.info(f"已自动保存 session {session_id} 到数据库")

        return jsonify({
            "response": bot_reply,
        })

    except Exception as e:
        logger.error(f"调用大模型时出错: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500