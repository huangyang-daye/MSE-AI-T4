# 医疗问诊应用部署指南

## 1. 环境准备

### 1.1 前端部署环境
- Node.js 16+
- npm 8+
- 静态文件服务器（如Nginx、Apache）或云托管服务（如Vercel、Netlify）

### 1.2 后端部署环境
- Node.js 16+
- npm 8+
- MongoDB 5+
- 环境变量配置

## 2. 前端部署步骤

### 2.1 构建前端应用
```bash
# 进入前端目录
cd /path/to/medical_app/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2.2 部署到静态文件服务器
将构建生成的`build`目录内容复制到Web服务器的根目录。

### 2.3 部署到云托管服务
可以使用Vercel或Netlify等服务进行一键部署：
```bash
# 使用Vercel部署
npx vercel --prod
```

## 3. 后端部署步骤

### 3.1 准备环境变量
创建`.env`文件，包含以下环境变量：
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/medical_app
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
NODE_ENV=production
```

### 3.2 安装依赖并启动
```bash
# 进入后端目录
cd /path/to/medical_app/backend

# 安装依赖
npm install

# 启动生产服务器
npm start
```

### 3.3 使用PM2进行进程管理
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start src/index.js --name medical-app-backend

# 设置开机自启
pm2 startup
pm2 save
```

## 4. 数据库配置

### 4.1 MongoDB设置
```bash
# 创建数据库
mongo
> use medical_app
> db.createUser({
    user: "medical_app_user",
    pwd: "secure_password",
    roles: [{ role: "readWrite", db: "medical_app" }]
  })
```

### 4.2 数据库连接配置
更新`.env`文件中的`MONGODB_URI`为：
```
MONGODB_URI=mongodb://medical_app_user:secure_password@localhost:27017/medical_app
```

## 5. 反向代理配置（Nginx）

### 5.1 Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/medical_app/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 启用HTTPS
```bash
# 安装Certbot
apt-get install certbot python3-certbot-nginx

# 获取并配置SSL证书
certbot --nginx -d your-domain.com
```

## 6. 容器化部署（Docker）

### 6.1 创建Docker Compose配置
创建`docker-compose.yml`文件：
```yaml
version: '3'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/medical_app
      - JWT_SECRET=your_jwt_secret_key
      - OPENAI_API_KEY=your_openai_api_key
      - OPENAI_MODEL=gpt-4
      - NODE_ENV=production
    networks:
      - app-network

  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb-data:/data/db
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongodb-data:
```

### 6.2 启动容器
```bash
docker-compose up -d
```

## 7. 云平台部署

### 7.1 AWS部署
- 前端：使用S3 + CloudFront
- 后端：使用Elastic Beanstalk或EC2
- 数据库：使用MongoDB Atlas或DocumentDB

### 7.2 Google Cloud部署
- 前端：使用Firebase Hosting
- 后端：使用App Engine或Cloud Run
- 数据库：使用MongoDB Atlas或Cloud Firestore

### 7.3 Azure部署
- 前端：使用Azure Static Web Apps
- 后端：使用App Service
- 数据库：使用MongoDB Atlas或Cosmos DB

## 8. 部署后检查

### 8.1 健康检查
- 确保前端能够正常加载
- 确保后端API能够正常响应
- 确保数据库连接正常

### 8.2 性能监控
- 设置应用性能监控
- 配置日志收集和分析
- 设置警报机制

## 9. 备份与恢复

### 9.1 数据库备份
```bash
# MongoDB备份
mongodump --uri="mongodb://medical_app_user:secure_password@localhost:27017/medical_app" --out=/backup/medical_app_$(date +%Y%m%d)
```

### 9.2 自动备份脚本
创建定时备份脚本并添加到crontab：
```bash
# 每天凌晨2点执行备份
0 2 * * * /path/to/backup_script.sh
```
