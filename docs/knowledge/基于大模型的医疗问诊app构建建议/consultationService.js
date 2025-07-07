const OpenAI = require('openai');
const logger = require('../utils/logger');
const { ConsultationSession } = require('../models/consultationModel');
const { HealthRecord } = require('../models/healthRecordModel');
const { User } = require('../models/userModel');

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * 创建新的问诊会话
 */
exports.createSession = async (userId, initialSymptoms) => {
  try {
    // 获取用户健康档案信息
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 创建新的问诊会话
    const session = new ConsultationSession({
      userId,
      initialSymptoms,
      messages: initialSymptoms ? [
        { role: 'system', content: getSystemPrompt(user.healthProfile) },
        { role: 'user', content: initialSymptoms }
      ] : [
        { role: 'system', content: getSystemPrompt(user.healthProfile) }
      ],
      status: 'active'
    });
    
    await session.save();
    
    // 如果有初始症状，生成AI回复
    let aiResponse = null;
    if (initialSymptoms) {
      aiResponse = await generateAIResponse(session._id);
    }
    
    return {
      sessionId: session._id,
      initialResponse: aiResponse
    };
  } catch (error) {
    logger.error(`创建问诊会话失败: ${error.message}`);
    throw error;
  }
};

/**
 * 处理用户消息并获取AI回复
 */
exports.processUserMessage = async (sessionId, message, userInfo) => {
  try {
    // 获取会话
    const session = await ConsultationSession.findById(sessionId);
    if (!session) {
      throw new Error('问诊会话不存在');
    }
    
    // 添加用户消息到会话
    session.messages.push({ role: 'user', content: message });
    await session.save();
    
    // 生成AI回复
    const aiResponse = await generateAIResponse(sessionId, userInfo);
    
    return aiResponse;
  } catch (error) {
    logger.error(`处理用户消息失败: ${error.message}`);
    throw error;
  }
};

/**
 * 生成诊断结果
 */
exports.generateDiagnosis = async (sessionId) => {
  try {
    // 获取会话
    const session = await ConsultationSession.findById(sessionId);
    if (!session) {
      throw new Error('问诊会话不存在');
    }
    
    // 添加诊断请求到会话
    session.messages.push({ 
      role: 'user', 
      content: '请根据我提供的症状和信息，给出可能的诊断结果、建议和用药参考。' 
    });
    await session.save();
    
    // 生成诊断结果
    const diagnosisPrompt = getDiagnosisPrompt();
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        ...session.messages,
        { role: 'system', content: diagnosisPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    const diagnosisResponse = response.choices[0].message.content;
    
    // 解析诊断结果
    const diagnosis = parseDiagnosisResponse(diagnosisResponse);
    
    // 保存诊断结果到会话
    session.messages.push({ role: 'assistant', content: diagnosisResponse });
    session.diagnosis = diagnosis;
    session.status = 'completed';
    await session.save();
    
    // 创建健康记录
    await createHealthRecordFromDiagnosis(session.userId, diagnosis, session._id);
    
    return diagnosis;
  } catch (error) {
    logger.error(`生成诊断结果失败: ${error.message}`);
    throw error;
  }
};

/**
 * 获取用药建议
 */
exports.getMedicationAdvice = async (sessionId, diagnosis) => {
  try {
    // 获取会话
    const session = await ConsultationSession.findById(sessionId);
    if (!session) {
      throw new Error('问诊会话不存在');
    }
    
    // 获取用户健康档案信息
    const user = await User.findById(session.userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 生成用药建议
    const medicationPrompt = getMedicationPrompt(diagnosis, user.healthProfile);
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: medicationPrompt },
        { role: 'user', content: JSON.stringify(diagnosis) }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    const medicationResponse = response.choices[0].message.content;
    
    // 解析用药建议
    const medicationAdvice = parseMedicationResponse(medicationResponse);
    
    // 保存用药建议到会话
    session.medicationAdvice = medicationAdvice;
    await session.save();
    
    return medicationAdvice;
  } catch (error) {
    logger.error(`获取用药建议失败: ${error.message}`);
    throw error;
  }
};

/**
 * 获取常见症状列表
 */
exports.getCommonSymptoms = async () => {
  // 返回预定义的常见症状列表
  return [
    { id: 1, name: '发热', category: '全身症状' },
    { id: 2, name: '头痛', category: '神经系统' },
    { id: 3, name: '咳嗽', category: '呼吸系统' },
    { id: 4, name: '喉咙痛', category: '呼吸系统' },
    { id: 5, name: '流鼻涕', category: '呼吸系统' },
    { id: 6, name: '胸痛', category: '心血管系统' },
    { id: 7, name: '腹痛', category: '消化系统' },
    { id: 8, name: '恶心呕吐', category: '消化系统' },
    { id: 9, name: '腹泻', category: '消化系统' },
    { id: 10, name: '皮疹', category: '皮肤' },
    { id: 11, name: '关节痛', category: '肌肉骨骼系统' },
    { id: 12, name: '疲劳', category: '全身症状' }
  ];
};

/**
 * 生成AI回复
 * @private
 */
async function generateAIResponse(sessionId, userInfo = null) {
  try {
    const session = await ConsultationSession.findById(sessionId);
    if (!session) {
      throw new Error('问诊会话不存在');
    }
    
    // 获取用户健康档案信息
    let healthProfile = null;
    if (userInfo) {
      healthProfile = userInfo.healthProfile;
    } else {
      const user = await User.findById(session.userId);
      if (user) {
        healthProfile = user.healthProfile;
      }
    }
    
    // 准备消息历史
    const messages = [...session.messages];
    
    // 如果是第一条消息，添加系统提示
    if (messages.length <= 2) {
      messages[0] = { role: 'system', content: getSystemPrompt(healthProfile) };
    }
    
    // 调用OpenAI API
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const aiMessage = response.choices[0].message.content;
    
    // 保存AI回复到会话
    session.messages.push({ role: 'assistant', content: aiMessage });
    await session.save();
    
    // 解析下一步问题和选项
    const nextQuestion = parseNextQuestion(aiMessage);
    
    return {
      message: aiMessage,
      nextQuestion
    };
  } catch (error) {
    logger.error(`生成AI回复失败: ${error.message}`);
    throw error;
  }
}

/**
 * 从诊断结果创建健康记录
 * @private
 */
async function createHealthRecordFromDiagnosis(userId, diagnosis, sessionId) {
  try {
    const healthRecord = new HealthRecord({
      userId,
      sessionId,
      date: new Date(),
      mainSymptoms: diagnosis.symptoms.join(', '),
      diagnosis: diagnosis.possibleConditions.map(c => c.name).join(', '),
      recommendations: diagnosis.recommendations.map(r => r.content).join('; '),
      medications: diagnosis.medications.map(m => ({
        name: m.name,
        dosage: m.usage,
        purpose: m.purpose
      })),
      status: '待观察'
    });
    
    await healthRecord.save();
    return healthRecord;
  } catch (error) {
    logger.error(`创建健康记录失败: ${error.message}`);
    throw error;
  }
}

/**
 * 获取系统提示
 * @private
 */
function getSystemPrompt(healthProfile) {
  return `你是一个专业的医疗问诊助手，你的任务是通过对话引导用户描述症状，收集相关信息，并提供初步的诊疗建议。

请遵循以下原则：
1. 一步一步引导用户，每次只问一个问题
2. 使用简单易懂的语言，避免过多专业术语
3. 对用户的回答表示理解和共情
4. 不要做出确定的诊断，只提供可能的情况和建议
5. 对于严重症状，建议用户及时就医
6. 保持专业、耐心和友好的态度

用户健康档案信息：
${healthProfile ? JSON.stringify(healthProfile) : '暂无健康档案信息'}

请开始问诊流程，首先询问用户的主要症状。`;
}

/**
 * 获取诊断提示
 * @private
 */
function getDiagnosisPrompt() {
  return `请根据用户提供的症状和信息，生成一个结构化的诊断结果。结果应包含以下部分：

1. 可能的病因分析：列出2-3种可能的病因，并标注可能性（高/中/低）
2. 诊疗建议：包括就医建议、自我护理和生活调整等
3. 用药参考：可能有帮助的非处方药物，包括用法用量和注意事项
4. 需要注意的警示症状：出现这些症状时应立即就医

请以JSON格式返回结果，格式如下：
{
  "symptoms": ["症状1", "症状2", ...],
  "possibleConditions": [
    {
      "name": "疾病名称",
      "probability": "高/中/低",
      "description": "简短描述"
    },
    ...
  ],
  "recommendations": [
    {
      "type": "就医建议/自我护理/生活调整",
      "content": "具体建议内容",
      "urgency": "紧急/一般/推荐"
    },
    ...
  ],
  "medications": [
    {
      "name": "药物名称",
      "usage": "用法用量",
      "purpose": "用途",
      "notes": "注意事项"
    },
    ...
  ],
  "warningSymptoms": ["警示症状1", "警示症状2", ...]
}

重要提示：
- 不要做出确定的诊断，只提供可能的情况
- 强调这些建议仅供参考，不能替代专业医生的诊断
- 对于严重症状，明确建议用户及时就医`;
}

/**
 * 获取用药提示
 * @private
 */
function getMedicationPrompt(diagnosis, healthProfile) {
  return `请根据用户的诊断结果和健康档案信息，提供安全、合理的用药建议。

诊断结果：
${JSON.stringify(diagnosis)}

用户健康档案：
${healthProfile ? JSON.stringify(healthProfile) : '暂无健康档案信息'}

请考虑以下因素：
1. 用户的过敏史和既往病史
2. 可能的药物相互作用
3. 特殊人群（如孕妇、儿童、老年人）的用药注意事项
4. 非处方药的适用范围和局限性

请以JSON格式返回用药建议，格式如下：
{
  "medications": [
    {
      "name": "药物名称",
      "category": "药物类别",
      "usage": "用法用量",
      "purpose": "用途",
      "sideEffects": "常见副作用",
      "contraindications": "禁忌症",
      "notes": "注意事项"
    },
    ...
  ],
  "generalAdvice": "一般用药建议",
  "disclaimer": "用药免责声明"
}

重要提示：
- 仅推荐适合自我用药的非处方药
- 明确说明这些建议仅供参考，不能替代医生的处方
- 建议用户在使用任何药物前咨询医生或药师`;
}

/**
 * 解析诊断结果
 * @private
 */
function parseDiagnosisResponse(response) {
  try {
    // 尝试直接解析JSON
    return JSON.parse(response);
  } catch (error) {
    // 如果不是有效的JSON，尝试提取JSON部分
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        logger.error(`解析诊断结果JSON失败: ${e.message}`);
      }
    }
    
    // 如果无法解析，返回一个基本结构
    logger.error(`无法解析诊断结果: ${error.message}`);
    return {
      symptoms: [],
      possibleConditions: [],
      recommendations: [],
      medications: [],
      warningSymptoms: []
    };
  }
}

/**
 * 解析用药建议
 * @private
 */
function parseMedicationResponse(response) {
  try {
    // 尝试直接解析JSON
    return JSON.parse(response);
  } catch (error) {
    // 如果不是有效的JSON，尝试提取JSON部分
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        logger.error(`解析用药建议JSON失败: ${e.message}`);
      }
    }
    
    // 如果无法解析，返回一个基本结构
    logger.error(`无法解析用药建议: ${error.message}`);
    return {
      medications: [],
      generalAdvice: "请在医生指导下用药。",
      disclaimer: "以上用药建议仅供参考，不能替代医生的处方。"
    };
  }
}

/**
 * 解析下一步问题和选项
 * @private
 */
function parseNextQuestion(aiMessage) {
  // 简单实现：检查消息中是否包含问题和选项
  const hasQuestion = /\?|？|吗|呢/.test(aiMessage);
  
  // 尝试提取选项
  const optionsMatch = aiMessage.match(/([1-9][.、]|[-*•]) .+/g);
  const options = optionsMatch ? optionsMatch.map(o => o.replace(/^[1-9][.、]|[-*•] /, '').trim()) : [];
  
  return {
    hasQuestion,
    options,
    isMultipleChoice: options.length > 0 && /多选|可多选|可以多选|选择所有|全部选择/.test(aiMessage)
  };
}
