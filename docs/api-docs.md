暂定的API文档结构：
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