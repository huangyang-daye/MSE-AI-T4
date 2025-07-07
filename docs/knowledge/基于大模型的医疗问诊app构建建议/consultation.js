const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');

// 初始化问诊会话
router.post('/start', consultationController.startConsultation);

// 发送用户消息并获取AI回复
router.post('/message', consultationController.processMessage);

// 获取诊断结果
router.post('/diagnosis', consultationController.generateDiagnosis);

// 获取用药建议
router.post('/medication', consultationController.getMedicationAdvice);

// 获取常见症状列表
router.get('/symptoms', consultationController.getCommonSymptoms);

module.exports = router;
