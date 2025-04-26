# 健康伴侣 App 产品手册

## 1. 产品概述
健康伴侣是一款全面的健康管理应用程序，旨在通过LLM技术和个性化服务为用户提供全方位的健康支持。与简单的医疗问答应用不同，健康伴侣更注重于成为用户的私人健康顾问，提供包括日常健康管理、疾病预防、症状追踪和治疗方案优化等在内的综合服务。

### 核心功能
- **医疗问答**：用户可以通过自然语言提问，获取专业的医疗建议和答案。
- **日常提醒**：用户可以设置每日提醒，提醒用户喝水或用药。
- **病情追踪**：用户可以记录每日症状变化，获取基于现有数据的趋势分析报告。
- **个性化服务**：根据用户的输入进行智能分析，提供更为个性化的指导建议。
- **智能助理**：提供智能助理服务，为用户提供个性化的健康建议。
- **紧急联系人通知**：在用户错过重要用药提醒时通知预设的紧急联系人。

## 2. 技术栈
- **后端**：Python, Flask, Django, FastAPI
- **前端**：React, Vue, Angular

## 3. 项目结构概览
```
MSE-AI-T4/
    ├── backend/               # 后端代码，主要由林凡钧、刘佳凡、徐平负责维护
    │   ├── app.py             # 主应用文件（如 Flask/Django/FastAPI）
    │   ├── requirements.txt   # Python依赖包列表
    │   ├── models/            # 存放模型相关的代码
    │   ├── services/          # 服务层逻辑（如与LLM交互）
    │   └── tests/             # 后端单元测试，主要由翟怡丹、王博海负责维护
    ├── frontend/              # 前端代码，主要由苏宇翔、徐嘉雯、徐平负责维护
    │   ├── public/            # 静态资源
    │   ├── src/               # React/Vue/Angular等前端框架代码
    │   │   ├── components/    # UI组件
    │   │   ├── pages/         # 页面组件
    │   │   └── App.js         # 主入口文件
    │   ├── package.json       # 前端依赖包列表
    │   └── README.md          # 前端说明文档
    ├── docs/                  # 文档目录，主要由黄杨、董宜涛、姚之远负责维护
    │   ├── api-docs.md        # API 文档
    │   ├── architecture.md    # 系统架构设计
    │   ├── user-guide.md      # 用户指南
    │   └── dev-guide.md       # 开发者指南
    ├── data/                  # 数据相关
    │   ├── raw/               # 原始数据集
    │   ├── processed/         # 处理后的数据
    │   └── README.md          # 数据说明
    ├── .gitignore             # 忽略文件规则
    ├── README.md              # 项目主说明文档
    └── LICENSE                # 开源许可证
```

## 4. API接口设计
### 用户认证与管理
- `POST /auth/register` - 注册新用户
- `POST /auth/login` - 用户登录
- `GET /user/profile` - 获取用户个人信息
- `PUT /user/profile` - 更新用户个人信息

### 医疗问答
- `POST /qa/ask` - 提交一个问题
- `GET /qa/history` - 获取提问历史记录
- `GET /qa/{question_id}` - 获取特定问题的回答详情

### 知识库访问
- `GET /knowledge/search` - 搜索知识库中的相关内容
- `GET /knowledge/article/{article_id}` - 查看具体文章详情

### 日常提醒
#### 创建/更新/删除提醒
- `POST /reminder/create` - 创建新的喝水或用药提醒
- `GET /reminder/list` - 获取所有已设置的提醒列表
- `PUT /reminder/update/{id}` - 更新特定提醒设置
- `DELETE /reminder/delete/{id}` - 删除特定提醒

#### 病情追踪
- `POST /healthlog/record` - 录入新的症状或健康状态
- `GET /healthlog/history` - 查看历史症状记录
- `GET /healthlog/trend` - 获取基于现有数据的趋势分析报告

## 5. 创新功能细节
### 每日提醒喝水用药
- 支持自定义提醒频率、智能调整提醒时间、多设备同步等功能。
- 药物管理与追踪：录入药物信息，提供药物相互作用警告及库存追踪。

### 病情追踪
- 记录每日症状变化，利用AI技术分析数据，识别模式并提供建议。
- 设置健康目标，获取达成反馈和成就系统激励。