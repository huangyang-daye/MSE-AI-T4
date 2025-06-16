# Import necessary libraries
from flask import Flask, render_template, request, redirect
from urllib.parse import unquote
from openai import OpenAI
import os
import time
import logging

# 配置日志记录
logging.basicConfig(
    level=logging.INFO,  # 设置日志级别为 INFO
    format='%(asctime)s - %(levelname)s - %(message)s',  # 日志格式
    handlers=[
        logging.FileHandler("app.log", encoding='utf-8'),  # 将日志写入文件，并指定 UTF-8 编码
        logging.StreamHandler()  # 同时将日志输出到控制台
    ]
)

# 创建 logger 对象
logger = logging.getLogger(__name__)

# Set the OpenAI API key
client = OpenAI(api_key="sk-qopksyugdcrdnafcehrtuvjfpqpnkkznzagihikhcwsnyinj", base_url="https://api.siliconflow.cn/v1")

# Define the name of the bot
name = '医疗问诊助手'

# Define the role of the bot
role = '通过对话引导用户描述症状，收集相关信息，并提供初步的诊疗建议'

# Define the impersonated role with instructions
impersonated_role = f"""
   你是一个专业的{name},你的任务是 {role}。
    请遵循以下原则：
    1. 一步一步引导用户，每次只问一个问题
    2. 使用简单易懂的语言，避免过多专业术语
    3. 对用户的回答表示理解和共情
    4. 不要做出确定的诊断，只提供可能的情况和建议
    5. 对于严重症状，建议用户及时就医
    6. 保持专业、耐心和友好的态度
    请开始问诊流程，首先询问用户的主要症状。
"""

# Initialize variables for chat history
explicit_input = ""
# chatgpt_output = 'Chat log: /n'
# cwd = os.getcwd()
# i = 1

# Find an available chat history file
# while os.path.exists(os.path.join(cwd, f'chat_history{i}.txt')):
#     i += 1

# history_file = os.path.join(cwd, f'chat_history{i}.txt')

# Create a new chat history file
# with open(history_file, 'w', encoding='utf-8') as f:
#     f.write('\n')

# Initialize chat history
chat_history = ''

# Create a Flask web application
app = Flask(__name__)

# Function to safely decode user input
def safe_decode(user_input):
    """尝试多种方式解码用户输入"""
    if not user_input:
        return ""

    try:
        decoded = unquote(user_input)
    except Exception as e:
        logger.error(f"Error decoding input (URL decode): {str(e)}")
        raise ValueError("无法正确解析输入，请确保使用 UTF-8 编码。")

    try:
        decoded_gbk = decoded.encode('latin1').decode('gbk')
        logger.info(f"[GBK] Decoded using gbk: {decoded_gbk}")
        return decoded_gbk
    except Exception as e:
        logger.error(f"Error converting from GBK to utf-8: {str(e)}")

    try:
        decoded_utf8 = decoded.encode('utf-8').decode('utf-8')
        return decoded_utf8
    except:
        pass

    try:
        decoded_latin1 = decoded.encode('latin1').decode('utf-8')
        logger.info(f"[latin1] Decoded using latin1: {decoded_latin1}")
        return decoded_latin1
    except Exception as e:
        logger.error(f"Error converting from latin1 to utf-8: {str(e)}")
        
    logger.warning("Failed to decode input, returning raw string.")
    return decoded

def chatcompletion(user_input, impersonated_role, explicit_input, chat_history):
    try:
        logger.info(f"Calling OpenAI API with user input: {user_input}")
        output = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-V2.5",
            temperature=1,
            presence_penalty=0,
            frequency_penalty=0,
            max_tokens=2000,
            messages=[
                {"role": "system", "content": f"{impersonated_role}. Conversation history: {chat_history}"},
                {"role": "user", "content": f"{user_input}. {explicit_input}"},
            ]
        )

        chatgpt_output = output.choices[0].message.content
        logger.info(f"Received response from OpenAI API: {chatgpt_output}")
        return chatgpt_output
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {str(e)}")
        raise

# Function to handle user chat input
def chat(user_input):
    global chat_history, name, chatgpt_output
    current_day = time.strftime("%d/%m", time.localtime())
    current_time = time.strftime("%H:%M:%S", time.localtime())
    chat_history += f'\nUser: {user_input}\n'
    logger.info(f"User input: {user_input}")

    try:
        user_input = safe_decode(user_input)

        chatgpt_raw_output = chatcompletion(user_input, impersonated_role, explicit_input, chat_history).replace(f'{name}:', '')
        chatgpt_output = f'{name}: {chatgpt_raw_output}'
        chat_history += chatgpt_output + '\n'
        
        # with open(history_file, 'a', encoding='utf-8') as f:
        #     f.write('\n'+ current_day+ ' '+ current_time+ ' User: ' +user_input +' \n' + current_day+ ' ' + current_time+  ' ' +  chatgpt_output + '\n')
        
        logger.info(f"Bot response: {chatgpt_output}")
        return chatgpt_raw_output
    except Exception as e:
        logger.error(f"Error processing chat: {str(e)}")
        raise

# Function to get a response from the chatbot
def get_response(userText):
    return chat(userText)

# Define app routes
@app.route("/")
def index():
    logger.info("Rendering index page")
    return render_template("chat.html")

@app.route("/get")
# Function for the bot response
@app.route("/get")
def get_bot_response():
    userText = request.args.get('msg')
    logger.info(f"Raw user message: {userText}")

    try:
        userText = safe_decode(userText)
        logger.info(f"Decoded user message: {userText}")

        response = str(get_response(userText))
        logger.info(f"Sending bot response: {response}")
        return response
    except Exception as e:
        logger.error(f"Error getting bot response: {str(e)}")
        return "抱歉，处理您的请求时发生了错误。"

@app.route('/refresh')
def refresh():
    logger.info("Refreshing page after 10 minutes")
    time.sleep(600)  # Wait for 10 minutes
    return redirect('/refresh')

# Run the Flask app
if __name__ == "__main__":
    logger.info("Starting Flask application")
    app.run(host='0.0.0.0', port=8000)
