---
license: apache-2.0
---

# 扁鹊（BianQue）：通过混合指令和多轮医生问询数据集的微调，提高医疗聊天模型的“问”能力

<a href='https://huggingface.co/scutcyr/SoulChat' target="__blank">SoulChat</a> &nbsp; | 
 &nbsp; <a href='https://github.com/scutcyr/BianQue' target="__blank">BianQue</a>&nbsp; |

基于主动健康的主动性、预防性、精确性、个性化、共建共享、自律性六大特征，华工未来技术学院-广东省数字孪生人重点实验室开源了中文领域生活空间主动健康大模型基座ProactiveHealthGPT，包括：
* 经过千万规模中文健康对话数据指令微调的[生活空间健康大模型扁鹊（BianQue）](https://github.com/scutcyr/BianQue)    
* 经过百万规模心理咨询领域中文长文本指令与多轮共情对话数据联合指令微调的[心理健康大模型灵心（SoulChat）](https://github.com/scutcyr/SoulChat)   

我们期望，**生活空间主动健康大模型基座ProactiveHealthGPT** 可以帮助学术界加速大模型在慢性病、心理咨询等主动健康领域的研究与应用。本项目为 **生活空间健康大模型扁鹊（BianQue）** 。


## 最近更新
- 👏🏻  2023.06.06: 扁鹊-2.0模型开源，详情见[BianQue-2.0](https://huggingface.co/scutcyr/BianQue-2)。
- 👏🏻  2023.06.06: 具备共情与倾听能力的灵心健康大模型SoulChat发布，详情见：[灵心健康大模型SoulChat：通过长文本咨询指令与多轮共情对话数据集的混合微调，提升大模型的“共情”能力 ](https://huggingface.co/scutcyr/SoulChat)。
- 👏🏻  2023.04.22: 基于扁鹊-1.0模型的医疗问答系统Demo，详情访问：[https://huggingface.co/spaces/scutcyr/BianQue](https://huggingface.co/spaces/scutcyr/BianQue)
- 👏🏻  2023.04.22: 扁鹊-1.0版本模型发布，详情见：[扁鹊-1.0：通过混合指令和多轮医生问询数据集的微调，提高医疗聊天模型的“问”能力（BianQue-1.0: Improving the "Question" Ability of Medical Chat Model through finetuning with Hybrid Instructions and Multi-turn Doctor QA Datasets）](https://huggingface.co/scutcyr/BianQue-1.0)

## 扁鹊健康大数据BianQueCorpus

我们经过调研发现，在健康领域，用户通常不会在一轮交互当中清晰地描述自己的问题，而当前常见的开源医疗问答模型（例如：ChatDoctor、本草(HuaTuo，原名华驼 )、DoctorGLM、MedicalGPT-zh）侧重于解决单轮用户描述的问题，而忽略了“用户描述可能存在不足”的情况。哪怕是当前大火的ChatGPT也会存在类似的问题：如果用户不强制通过文本描述让ChatGPT采用一问一答的形式，ChatGPT也偏向于针对用户的描述，迅速给出它认为合适的建议和方案。然而，实际的医生与用户交谈往往会存在“医生根据用户当前的描述进行持续多轮的询问”。并且医生在最后根据用户提供的信息综合给出建议。我们把医生不断问询的过程定义为 **询问链（CoQ, Chain of Questioning）** ，当模型处于询问链阶段，其下一个问题通常由对话上下文历史决定。

我们结合当前开源的中文医疗问答数据集（[MedDialog-CN](https://github.com/UCSD-AI4H/Medical-Dialogue-System)、[IMCS-V2](https://github.com/lemuria-wchen/imcs21)、[CHIP-MDCFNPC](https://tianchi.aliyun.com/dataset/95414)、[MedDG](https://tianchi.aliyun.com/dataset/95414)、[cMedQA2](https://github.com/zhangsheng93/cMedQA2)、[Chinese-medical-dialogue-data](https://github.com/Toyhom/Chinese-medical-dialogue-data)），，分析其中的单轮/多轮特性以及医生问询特性，结合实验室长期自建的生活空间健康对话大数据，构建了千万级别规模的扁鹊健康大数据BianQueCorpus。对话数据通过“病人：xxx\n医生：xxx\n病人：xxx\n医生：”的形式统一为一种指令格式

```data
input: "病人：六岁宝宝拉大便都是一个礼拜或者10天才一次正常吗，要去医院检查什么项目\n医生：您好\n病人：六岁宝宝拉大便都是一个礼拜或者10天才一次正常吗，要去医院检查什么项目\n医生：宝宝之前大便什么样呢？多久一次呢\n病人：一般都是一个礼拜，最近这几个月都是10多天\n医生：大便干吗？\n病人：每次10多天拉的很多\n医生："
target: "成形还是不成形呢？孩子吃饭怎么样呢？"
```

训练数据当中混合了大量target文本为**医生问询的内容**而非直接的建议，这将有助于提升AI模型的问询能力。


## 使用方法
* 克隆本项目
```bash
cd ~
git clone https://github.com/scutcyr/BianQue.git
```

* 安装依赖
需要注意的是torch的版本需要根据你的服务器实际的cuda版本选择，详情参考[pytorch安装指南](https://pytorch.org/get-started/previous-versions/)
```bash
cd BianQue
conda env create -n proactivehealthgpt_py38 --file proactivehealthgpt_py38.yml
conda activate proactivehealthgpt_py38

pip install cpm_kernels
pip install torch==1.13.1+cu116 torchvision==0.14.1+cu116 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu116
```

* 在Python当中调用BianQue-2.0模型
```python
import torch
from transformers import AutoModel, AutoTokenizer
# GPU设置
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# 加载模型与tokenizer
model_name_or_path = 'scutcyr/BianQue-2'
model = AutoModel.from_pretrained(model_name_or_path, trust_remote_code=True).half()
model.to(device)
tokenizer = AutoTokenizer.from_pretrained(model_name_or_path, trust_remote_code=True)

# 单轮对话调用模型的chat函数
user_input = "我的宝宝发烧了，怎么办？"
input_text = "病人：" + user_input + "\n医生："
response, history = model.chat(tokenizer, query=input_text, history=None, max_length=2048, num_beams=1, do_sample=True, top_p=0.75, temperature=0.95, logits_processor=None)

# 多轮对话调用模型的chat函数
# 注意：本项目使用"\n病人："和"\n医生："划分不同轮次的对话历史
# 注意：user_history比bot_history的长度多1
user_history = ['你好', '我最近失眠了']
bot_history = ['我是利用人工智能技术，结合大数据训练得到的智能医疗问答模型扁鹊，你可以向我提问。']
# 拼接对话历史
context = "\n".join([f"病人：{user_history[i]}\n医生：{bot_history[i]}" for i in range(len(bot_history))])
input_text = context + "\n病人：" + user_history[-1] + "\n医生："

response, history = model.chat(tokenizer, query=input_text, history=None, max_length=2048, num_beams=1, do_sample=True, top_p=0.75, temperature=0.95, logits_processor=None)
```

* 启动服务
   
本项目提供了[bianque_v2_app.py](https://github.com/scutcyr/BianQue/blob/main/bianque_v2_app.py)作为BianQue-2.0模型的使用示例，通过以下命令即可开启服务，然后，通过http://<your_ip>:9005访问。
```bash
streamlit run bianque_v2_app.py --server.port 9005
```
特别地，在[bianque_v2_app.py](./bianque_v2_app.py)当中，
可以修改以下代码更换指定的显卡：
```python
os.environ['CUDA_VISIBLE_DEVICES'] = '1'
```
可以通过更改以下代码指定模型路径为本地路径：
```python
model_name_or_path = "scutcyr/BianQue-2"
```

我们还提供了[bianque_v1_app.py](https://github.com/scutcyr/BianQue/blob/main/bianque_v1_app.py)作为BianQue-1.0模型的使用示例，以及[bianque_v1_v2_app.py](./bianque_v1_v2_app.py)作为BianQue-1.0模型和BianQue-2.0模型的联合使用示例。


## 声明
* 本项目使用了ChatGLM-6B 模型的权重，需要遵循其[MODEL_LICENSE](https://github.com/THUDM/ChatGLM-6B/blob/main/MODEL_LICENSE)，因此，**本项目仅可用于您的非商业研究目的**。
* 本项目提供的BianQue模型致力于提升大模型的健康对话能力（多轮问询及健康建议），然而，模型的输出文本具有一定的随机性，本项目不保证模型输出的文本完全适合于用户，用户在使用本模型时需要承担其带来的所有风险！
* 您不得出于任何商业、军事或非法目的使用、复制、修改、合并、发布、分发、复制或创建BianQue模型的全部或部分衍生作品。
* 您不得利用BianQue模型从事任何危害国家安全和国家统一、危害社会公共利益、侵犯人身权益的行为。
* 您在使用BianQue模型时应知悉，其不能替代医生、心理医生等专业人士，不应过度依赖、服从、相信模型的输出，不能过度依赖于与BianQue模型聊天获取的健康建议。


## 致谢
本项目由[华南理工大学未来技术学院](https://www2.scut.edu.cn/ft/main.htm) 广东省数字孪生人重点实验室发起，得到了华南理工大学信息网络工程研究中心支撑，同时致谢合作单位广东省妇幼保健院、广州市妇女儿童医疗中心、中山大学附属第三医院等。

## 引用
```bib
@article{chen2023bianque1,
      title={BianQue-1.0: Improving the "Question" Ability of Medical Chat Model through finetuning with Hybrid Instructions and Multi-turn Doctor QA Datasets}, 
      author={Yirong Chen and Zhenyu Wang and Xiaofen Xing and Zhipei Xu and Kai Fang and Sihang Li and Junhong Wang and Xiangmin Xu},
      year={2023},
      url={https://github.com/scutcyr/BianQue}
}
```