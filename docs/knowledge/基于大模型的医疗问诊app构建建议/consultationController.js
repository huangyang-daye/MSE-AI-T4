const consultationService = require('../services/consultationService');
const { validateConsultationInput } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * 开始新的问诊会话
 */
exports.startConsultation = async (req, res, next) => {
  try {
    const { userId, initialSymptoms } = req.body;
    
    // 验证输入
    if (!userId) {
      return res.status(400).json({ message: '用户ID不能为空' });
    }
    
    // 创建新的问诊会话
    const session = await consultationService.createSession(userId, initialSymptoms);
    
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error(`开始问诊会话失败: ${error.message}`);
    next(error);
  }
};

/**
 * 处理用户消息并获取AI回复
 */
exports.processMessage = async (req, res, next) => {
  try {
    const { sessionId, message, userInfo } = req.body;
    
    // 验证输入
    if (!sessionId || !message) {
      return res.status(400).json({ message: '会话ID和消息内容不能为空' });
    }
    
    // 处理消息并获取AI回复
    const response = await consultationService.processUserMessage(sessionId, message, userInfo);
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error(`处理用户消息失败: ${error.message}`);
    next(error);
  }
};

/**
 * 生成诊断结果
 */
exports.generateDiagnosis = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    
    // 验证输入
    if (!sessionId) {
      return res.status(400).json({ message: '会话ID不能为空' });
    }
    
    // 生成诊断结果
    const diagnosis = await consultationService.generateDiagnosis(sessionId);
    
    res.status(200).json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    logger.error(`生成诊断结果失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取用药建议
 */
exports.getMedicationAdvice = async (req, res, next) => {
  try {
    const { sessionId, diagnosis } = req.body;
    
    // 验证输入
    if (!sessionId || !diagnosis) {
      return res.status(400).json({ message: '会话ID和诊断结果不能为空' });
    }
    
    // 获取用药建议
    const medicationAdvice = await consultationService.getMedicationAdvice(sessionId, diagnosis);
    
    res.status(200).json({
      success: true,
      data: medicationAdvice
    });
  } catch (error) {
    logger.error(`获取用药建议失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取常见症状列表
 */
exports.getCommonSymptoms = async (req, res, next) => {
  try {
    const symptoms = await consultationService.getCommonSymptoms();
    
    res.status(200).json({
      success: true,
      data: symptoms
    });
  } catch (error) {
    logger.error(`获取常见症状列表失败: ${error.message}`);
    next(error);
  }
};
