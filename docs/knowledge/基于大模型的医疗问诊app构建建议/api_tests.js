// 前端测试脚本
// 测试用户注册和登录功能

const axios = require('axios');
const assert = require('assert');

// 配置API基础URL
const API_BASE_URL = 'http://localhost:3001/api';

// 测试数据
const testUser = {
  name: '测试用户',
  phone: '13800138000',
  password: 'Test123456',
  gender: 'male',
  birthdate: '1990-01-01'
};

// 存储测试过程中生成的数据
let testData = {
  token: null,
  userId: null,
  sessionId: null
};

// 测试用户注册
async function testUserRegistration() {
  console.log('测试用户注册...');
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, testUser);
    assert.strictEqual(response.status, 201, '注册应返回201状态码');
    assert.strictEqual(response.data.success, true, '注册应成功');
    assert.ok(response.data.data.userId, '应返回用户ID');
    
    testData.userId = response.data.data.userId;
    console.log('✅ 用户注册测试通过');
    return true;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('用户已存在，继续测试登录');
      return true;
    }
    console.error('❌ 用户注册测试失败:', error.message);
    return false;
  }
}

// 测试用户登录
async function testUserLogin() {
  console.log('测试用户登录...');
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      phone: testUser.phone,
      password: testUser.password
    });
    
    assert.strictEqual(response.status, 200, '登录应返回200状态码');
    assert.strictEqual(response.data.success, true, '登录应成功');
    assert.ok(response.data.data.token, '应返回访问令牌');
    
    testData.token = response.data.data.token;
    testData.userId = response.data.data.user.userId;
    
    console.log('✅ 用户登录测试通过');
    return true;
  } catch (error) {
    console.error('❌ 用户登录测试失败:', error.message);
    return false;
  }
}

// 测试健康档案更新
async function testHealthProfileUpdate() {
  console.log('测试健康档案更新...');
  try {
    const healthProfileData = {
      height: 175,
      weight: 70,
      bloodType: 'A',
      allergies: ['drug'],
      allergiesDetail: '对青霉素过敏',
      chronicDiseases: [],
      smokingStatus: 'never',
      drinkingStatus: 'occasional'
    };
    
    const response = await axios.put(
      `${API_BASE_URL}/users/health-profile`,
      healthProfileData,
      {
        headers: { Authorization: `Bearer ${testData.token}` }
      }
    );
    
    assert.strictEqual(response.status, 200, '健康档案更新应返回200状态码');
    assert.strictEqual(response.data.success, true, '健康档案更新应成功');
    
    console.log('✅ 健康档案更新测试通过');
    return true;
  } catch (error) {
    console.error('❌ 健康档案更新测试失败:', error.message);
    return false;
  }
}

// 测试开始问诊会话
async function testStartConsultation() {
  console.log('测试开始问诊会话...');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/consultation/start`,
      {
        userId: testData.userId,
        initialSymptoms: '我最近感到头痛、喉咙痛，并且有轻微发热。'
      },
      {
        headers: { Authorization: `Bearer ${testData.token}` }
      }
    );
    
    assert.strictEqual(response.status, 201, '开始问诊应返回201状态码');
    assert.strictEqual(response.data.success, true, '开始问诊应成功');
    assert.ok(response.data.data.sessionId, '应返回会话ID');
    
    testData.sessionId = response.data.data.sessionId;
    
    console.log('✅ 开始问诊会话测试通过');
    return true;
  } catch (error) {
    console.error('❌ 开始问诊会话测试失败:', error.message);
    return false;
  }
}

// 测试发送消息
async function testSendMessage() {
  console.log('测试发送消息...');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/consultation/message`,
      {
        sessionId: testData.sessionId,
        message: '症状持续了大约两天，我没有服用任何药物。'
      },
      {
        headers: { Authorization: `Bearer ${testData.token}` }
      }
    );
    
    assert.strictEqual(response.status, 200, '发送消息应返回200状态码');
    assert.strictEqual(response.data.success, true, '发送消息应成功');
    assert.ok(response.data.data.message, '应返回AI回复');
    
    console.log('✅ 发送消息测试通过');
    return true;
  } catch (error) {
    console.error('❌ 发送消息测试失败:', error.message);
    return false;
  }
}

// 测试生成诊断结果
async function testGenerateDiagnosis() {
  console.log('测试生成诊断结果...');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/consultation/diagnosis`,
      {
        sessionId: testData.sessionId
      },
      {
        headers: { Authorization: `Bearer ${testData.token}` }
      }
    );
    
    assert.strictEqual(response.status, 200, '生成诊断应返回200状态码');
    assert.strictEqual(response.data.success, true, '生成诊断应成功');
    assert.ok(response.data.data.possibleConditions, '应返回可能的病因');
    assert.ok(response.data.data.recommendations, '应返回建议');
    
    console.log('✅ 生成诊断结果测试通过');
    return true;
  } catch (error) {
    console.error('❌ 生成诊断结果测试失败:', error.message);
    return false;
  }
}

// 测试获取健康记录
async function testGetHealthRecords() {
  console.log('测试获取健康记录...');
  try {
    const response = await axios.get(
      `${API_BASE_URL}/health-records`,
      {
        headers: { Authorization: `Bearer ${testData.token}` }
      }
    );
    
    assert.strictEqual(response.status, 200, '获取健康记录应返回200状态码');
    assert.strictEqual(response.data.success, true, '获取健康记录应成功');
    assert.ok(Array.isArray(response.data.data), '应返回记录数组');
    
    console.log('✅ 获取健康记录测试通过');
    return true;
  } catch (error) {
    console.error('❌ 获取健康记录测试失败:', error.message);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始运行测试...');
  
  const registrationResult = await testUserRegistration();
  if (!registrationResult) return;
  
  const loginResult = await testUserLogin();
  if (!loginResult) return;
  
  const healthProfileResult = await testHealthProfileUpdate();
  if (!healthProfileResult) return;
  
  const startConsultationResult = await testStartConsultation();
  if (!startConsultationResult) return;
  
  const sendMessageResult = await testSendMessage();
  if (!sendMessageResult) return;
  
  const diagnosisResult = await testGenerateDiagnosis();
  if (!diagnosisResult) return;
  
  const healthRecordsResult = await testGetHealthRecords();
  if (!healthRecordsResult) return;
  
  console.log('🎉 所有测试通过!');
}

// 执行测试
runAllTests().catch(error => {
  console.error('测试过程中发生错误:', error);
});
