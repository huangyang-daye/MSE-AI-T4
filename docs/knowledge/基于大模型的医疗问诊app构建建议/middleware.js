const jwt = require('jsonwebtoken');
const logger = require('./logger');
const { User } = require('../models/userModel');

/**
 * JWT认证中间件
 * 验证请求头中的token，并将用户信息添加到req对象
 */
exports.authenticateJWT = (req, res, next) => {
  // 从请求头获取token
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        logger.error(`JWT验证失败: ${err.message}`);
        return res.status(403).json({ message: '访问令牌无效或已过期' });
      }
      
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: '未提供访问令牌' });
  }
};

/**
 * 请求速率限制中间件
 * 限制单个IP的请求频率，防止DoS攻击
 */
exports.rateLimiter = (req, res, next) => {
  // 简单实现，实际应用中应使用redis等存储请求计数
  const ip = req.ip;
  const now = Date.now();
  
  // 获取全局请求计数对象，如果不存在则创建
  if (!global.requestCounts) {
    global.requestCounts = {};
  }
  
  // 获取当前IP的请求记录，如果不存在则创建
  if (!global.requestCounts[ip]) {
    global.requestCounts[ip] = {
      count: 0,
      firstRequest: now
    };
  }
  
  // 如果距离第一次请求已经过去了1分钟，重置计数
  if (now - global.requestCounts[ip].firstRequest > 60000) {
    global.requestCounts[ip] = {
      count: 0,
      firstRequest: now
    };
  }
  
  // 增加请求计数
  global.requestCounts[ip].count++;
  
  // 如果1分钟内请求超过100次，返回429状态码
  if (global.requestCounts[ip].count > 100) {
    logger.warn(`IP ${ip} 请求频率过高，已限制访问`);
    return res.status(429).json({ message: '请求过于频繁，请稍后再试' });
  }
  
  next();
};

/**
 * 内容安全检查中间件
 * 检查用户输入是否包含敏感内容
 */
exports.contentSafetyCheck = (req, res, next) => {
  // 敏感词列表
  const sensitiveWords = [
    '自杀', '自残', '杀人', '爆炸', '制造炸弹', '毒品', '违禁药品'
  ];
  
  // 获取请求体中的文本内容
  const content = req.body.message || req.body.initialSymptoms || '';
  
  // 检查是否包含敏感词
  const containsSensitiveWord = sensitiveWords.some(word => content.includes(word));
  
  if (containsSensitiveWord) {
    logger.warn(`检测到敏感内容: ${content}`);
    return res.status(403).json({ 
      message: '检测到敏感内容，如您有紧急情况，请立即拨打急救电话120或前往最近的医院就诊' 
    });
  }
  
  next();
};

/**
 * 紧急情况检测中间件
 * 检测用户描述的症状是否属于紧急情况
 */
exports.emergencyDetection = (req, res, next) => {
  // 紧急症状关键词
  const emergencyKeywords = [
    '胸痛', '剧烈头痛', '呼吸困难', '大量出血', '意识不清', '抽搐', '休克',
    '突然瘫痪', '严重烧伤', '严重外伤', '自杀倾向'
  ];
  
  // 获取请求体中的文本内容
  const content = req.body.message || req.body.initialSymptoms || '';
  
  // 检查是否包含紧急症状关键词
  const isEmergency = emergencyKeywords.some(keyword => content.includes(keyword));
  
  if (isEmergency) {
    logger.warn(`检测到紧急情况: ${content}`);
    
    // 添加紧急情况标记，但仍继续处理请求
    req.isEmergency = true;
    
    // 在响应头中添加紧急情况标记
    res.set('X-Emergency-Detected', 'true');
  }
  
  next();
};

/**
 * 添加免责声明中间件
 * 在所有API响应中添加医疗免责声明
 */
exports.addDisclaimer = (req, res, next) => {
  // 保存原始的res.json方法
  const originalJson = res.json;
  
  // 重写res.json方法，在返回数据中添加免责声明
  res.json = function(data) {
    // 如果返回的是对象，添加免责声明
    if (typeof data === 'object' && data !== null) {
      data.disclaimer = {
        text: "免责声明：本应用提供的信息仅供参考，不构成医疗建议、诊断或治疗。本应用不能替代专业医疗咨询、诊断或治疗。如有任何健康问题，请咨询合格的医疗专业人员。在紧急情况下，请立即拨打急救电话或前往最近的医院就诊。",
        version: "1.0",
        timestamp: new Date().toISOString()
      };
      
      // 如果检测到紧急情况，添加紧急提示
      if (req.isEmergency) {
        data.emergencyAlert = {
          text: "紧急提示：根据您描述的症状，您可能需要立即就医。请拨打急救电话120或前往最近的医院急诊科。",
          level: "high"
        };
      }
    }
    
    // 调用原始的json方法
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * 日志记录中间件
 * 记录所有API请求
 */
exports.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 请求结束时记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    // 根据状态码决定日志级别
    if (res.statusCode >= 500) {
      logger.error('API请求错误', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('API请求警告', logData);
    } else {
      logger.info('API请求成功', logData);
    }
  });
  
  next();
};
