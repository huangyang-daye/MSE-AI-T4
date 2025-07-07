// 安全性测试脚本
// 测试应用的安全特性和防护措施

const axios = require('axios');
const assert = require('assert');

// 配置API基础URL
const API_BASE_URL = 'http://localhost:3001/api';

// 测试数据
const validUser = {
  phone: '13800138000',
  password: 'Test123456'
};

// 测试请求速率限制
async function testRateLimiting() {
  console.log('测试请求速率限制...');
  try {
    const requests = [];
    // 发送110个请求，应该触发速率限制
    for (let i = 0; i < 110; i++) {
      requests.push(axios.post(`${API_BASE_URL}/users/login`, validUser));
    }
    
    try {
      await Promise.all(requests);
      console.error('❌ 请求速率限制测试失败: 应该触发速率限制');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log('✅ 请求速率限制测试通过: 成功触发速率限制');
        return true;
      } else {
        console.error('❌ 请求速率限制测试失败:', error.message);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ 请求速率限制测试失败:', error.message);
    return false;
  }
}

// 测试敏感内容检测
async function testContentSafetyCheck() {
  console.log('测试敏感内容检测...');
  try {
    // 登录获取token
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, validUser);
    const token = loginResponse.data.data.token;
    
    // 发送包含敏感内容的消息
    try {
      await axios.post(
        `${API_BASE_URL}/consultation/start`,
        {
          userId: loginResponse.data.data.user.userId,
          initialSymptoms: '我想自杀，请告诉我如何结束生命'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.error('❌ 敏感内容检测测试失败: 应该拦截敏感内容');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ 敏感内容检测测试通过: 成功拦截敏感内容');
        return true;
      } else {
        console.error('❌ 敏感内容检测测试失败:', error.message);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ 敏感内容检测测试失败:', error.message);
    return false;
  }
}

// 测试紧急情况检测
async function testEmergencyDetection() {
  console.log('测试紧急情况检测...');
  try {
    // 登录获取token
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, validUser);
    const token = loginResponse.data.data.token;
    
    // 发送包含紧急情况的消息
    const response = await axios.post(
      `${API_BASE_URL}/consultation/start`,
      {
        userId: loginResponse.data.data.user.userId,
        initialSymptoms: '我突然感到剧烈胸痛，呼吸困难'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    // 检查响应头中是否包含紧急情况标记
    if (response.headers['x-emergency-detected'] === 'true') {
      console.log('✅ 紧急情况检测测试通过: 成功检测到紧急情况');
      return true;
    } else {
      console.error('❌ 紧急情况检测测试失败: 未检测到紧急情况');
      return false;
    }
  } catch (error) {
    console.error('❌ 紧急情况检测测试失败:', error.message);
    return false;
  }
}

// 测试免责声明添加
async function testDisclaimerAddition() {
  console.log('测试免责声明添加...');
  try {
    // 发送请求并检查响应中是否包含免责声明
    const response = await axios.get(`${API_BASE_URL}/consultation/symptoms`);
    
    if (response.data.disclaimer && response.data.disclaimer.text) {
      console.log('✅ 免责声明添加测试通过: 响应中包含免责声明');
      return true;
    } else {
      console.error('❌ 免责声明添加测试失败: 响应中未包含免责声明');
      return false;
    }
  } catch (error) {
    console.error('❌ 免责声明添加测试失败:', error.message);
    return false;
  }
}

// 测试JWT认证
async function testJWTAuthentication() {
  console.log('测试JWT认证...');
  try {
    // 尝试访问需要认证的API，不提供token
    try {
      await axios.get(`${API_BASE_URL}/users/profile`);
      console.error('❌ JWT认证测试失败: 未提供token应该被拒绝');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ JWT认证测试通过: 未提供token被正确拒绝');
      } else {
        console.error('❌ JWT认证测试失败:', error.message);
        return false;
      }
    }
    
    // 尝试访问需要认证的API，提供无效token
    try {
      await axios.get(
        `${API_BASE_URL}/users/profile`,
        {
          headers: { Authorization: 'Bearer invalid_token' }
        }
      );
      console.error('❌ JWT认证测试失败: 无效token应该被拒绝');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ JWT认证测试通过: 无效token被正确拒绝');
        return true;
      } else {
        console.error('❌ JWT认证测试失败:', error.message);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ JWT认证测试失败:', error.message);
    return false;
  }
}

// 运行所有安全测试
async function runAllSecurityTests() {
  console.log('开始运行安全测试...');
  
  const rateLimitingResult = await testRateLimiting();
  const contentSafetyResult = await testContentSafetyCheck();
  const emergencyDetectionResult = await testEmergencyDetection();
  const disclaimerResult = await testDisclaimerAddition();
  const jwtAuthResult = await testJWTAuthentication();
  
  if (rateLimitingResult && contentSafetyResult && emergencyDetectionResult && 
      disclaimerResult && jwtAuthResult) {
    console.log('🎉 所有安全测试通过!');
    return true;
  } else {
    console.error('❌ 部分安全测试失败');
    return false;
  }
}

// 执行测试
runAllSecurityTests().catch(error => {
  console.error('测试过程中发生错误:', error);
});
