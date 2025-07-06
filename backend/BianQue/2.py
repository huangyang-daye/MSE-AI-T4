
''' 运行方式
用 streamlit_chat和扁鹊基础模型搭建的一个健康伴侣聊天web页面,可以直接放在前端进行跳转
```bash
pip install transformers==4.40.2
pip install torch==1.13.1
pip install streamlit # 第一次运行需要安装streamlit
pip install streamlit_chat # 第一次运行需要安装streamlit_chat
pip install sentencepiece
streamlit run 2.py --server.port 9005 --server.address 0.0.0.0
```

## 测试访问

http://<your_ip>:9005

'''
import os
import torch
import streamlit as st
from streamlit_chat import message
from transformers import AutoModel, AutoTokenizer


os.environ['CUDA_VISIBLE_DEVICES'] = '0' # 默认使用0号显卡，避免Windows用户忘记修改该处
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# # Load model directly
# model_name_or_path = "scutcyr/BianQue-2"        
# model = AutoModel.from_pretrained("scutcyr/BianQue-2", trust_remote_code=True)
# tokenizer = AutoTokenizer.from_pretrained("scutcyr/BianQue-2", trust_remote_code=True)

# 修改为本地路径
model_name_or_path = "ours"  # 或绝对路径（如 "D:/models/bianque-2"）



def answer(user_history, bot_history, sample=True, top_p=0.7, temperature=0.95):
    '''sample：是否抽样。生成任务，可以设置为True;
    top_p=0.7, temperature=0.95时的生成效果较好
    top_p=1, temperature=0.7时提问能力会提升
    top_p：0-1之间，生成的内容越多样
    max_new_tokens=512 lost...'''

    if len(bot_history)>0:
        context = "\n".join([f"病人：{user_history[i]}\n医生：{bot_history[i]}" for i in range(len(bot_history))])
        input_text = context + "\n病人：" + user_history[-1] + "\n医生："
    else:
        input_text = "病人：" + user_history[-1] + "\n医生："
        #if user_history[-1] =="你好" or user_history[-1] =="你好！":
        return "我是利用人工智能技术，结合大数据训练得到的健康伴侣，你可以向我提问。"
            #return "我是生活空间健康对话大模型扁鹊，欢迎向我提问。"
    
    print(input_text)

    if not sample:
        response, history = model.chat(tokenizer, query=input_text, history=None, max_length=2048, num_beams=1, do_sample=False, top_p=top_p, temperature=temperature, logits_processor=None)
    else:
        response, history = model.chat(tokenizer, query=input_text, history=None, max_length=2048, num_beams=1, do_sample=True, top_p=top_p, temperature=temperature, logits_processor=None)

    print('医生: '+response)

    return response

# 修改为你的信息
st.set_page_config(
    page_title="健康伴侣",
    page_icon="💉",  # 替换emoji
    menu_items={'About': "版本：健康伴侣 v1.0\n Team: No.4"}
)
st.header("健康伴侣v1.0")

# ==================== 侧边栏 ====================
with st.sidebar:
    st.markdown("### 功能菜单")
    if st.button("🔄 新建对话"):
        st.session_state['generated'] = []
        st.session_state['past'] = []
        st.experimental_rerun()
    
    if st.button("📥 导出对话记录"):
        if st.session_state['generated']:
            chat_history = "\n\n".join([f"您: {p}\nAI: {g}" for p,g in zip(
                st.session_state.past, st.session_state.generated)])
            st.download_button(
                label="下载对话记录",
                data=chat_history,
                file_name="健康咨询记录.txt",
                mime="text/plain"
            )
        else:
            st.warning("没有可导出的对话记录")
    
    st.markdown("---")
    st.markdown("""
    <div class="disclaimer">
        <h4>⚠️ 重要提示</h4>
        <p>本AI提供的建议仅供参考，不能替代专业医疗诊断。如有紧急情况，请立即联系医生。</p>
    </div>
    """, unsafe_allow_html=True)
    
    with st.expander("ℹ️ 关于我们"):
        st.info("""
        - **版本**: 健康伴侣 v2.0
        - **机构**: ECNU Team No.4
        - **模型**: ChatGLM-2 医疗大模型
        - **联系方式**: contact@health-ai.com
        """)


# https://docs.streamlit.io/library/api-reference/performance/st.cache_resource

@st.cache_resource
def load_model():
    # model = AutoModel.from_pretrained(model_name_or_path, trust_remote_code=True).half()
    # 从本地加载模型
    model = AutoModel.from_pretrained(
    model_name_or_path,torch_dtype=torch.float32,
    trust_remote_code=True,
    local_files_only=True).half()
    print(device)
    model.to(device)
    print('Model Load done!')
    return model

@st.cache_resource
def load_tokenizer():
    # tokenizer = AutoTokenizer.from_pretrained(model_name_or_path, trust_remote_code=True)
    tokenizer = AutoTokenizer.from_pretrained(
    model_name_or_path,
    trust_remote_code=True,
    local_files_only=True  # ChatGLM的默认词汇表大小，根据模型调整
    )
    print('Tokenizer Load done!')
    return tokenizer

model = load_model()
tokenizer = load_tokenizer()

if 'generated' not in st.session_state:
    st.session_state['generated'] = []

if 'past' not in st.session_state:
    st.session_state['past'] = []

user_col, ensure_col = st.columns([5, 1])

def get_text():
    input_text = user_col.text_area("请在下列文本框输入您的咨询内容：","", key="input", placeholder="请输入您的咨询内容，并且点击Ctrl+Enter(或者发送按钮)确认内容")
    if ensure_col.button("发送", use_container_width=True):
        if input_text:
            return input_text  

user_input = get_text()

if user_input:
    st.session_state.past.append(user_input)
    output = answer(st.session_state['past'],st.session_state["generated"])
    st.session_state.generated.append(output)

if st.session_state['generated']:
    for i in range(len(st.session_state['generated'])):
        if i == 0:
            # 
            message(st.session_state['past'][i], is_user=True, key=str(i) + '_user', avatar_style="avataaars", seed=26)
            message(st.session_state["generated"][i]+"\n\n------------------\n以下回答由健康伴侣自动生成，仅供参考，！", key=str(i), avatar_style="avataaars", seed=5)
        else:
            message(st.session_state['past'][i], is_user=True, key=str(i) + '_user', avatar_style="avataaars", seed=26)
            #message(st.session_state["generated"][i], key=str(i))
            message(st.session_state["generated"][i], key=str(i), avatar_style="avataaars", seed=5)

if st.button("清理对话缓存"):
    # Clear values from *all* all in-memory and on-disk data caches:
    # i.e. clear values from both square and cube
    st.session_state['generated'] = []
    st.session_state['past'] = []
    