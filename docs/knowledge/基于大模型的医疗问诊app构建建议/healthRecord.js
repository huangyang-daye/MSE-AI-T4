const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecordController');

// 获取用户的健康记录列表
router.get('/', healthRecordController.getHealthRecords);

// 获取单个健康记录详情
router.get('/:id', healthRecordController.getHealthRecordById);

// 创建新的健康记录
router.post('/', healthRecordController.createHealthRecord);

// 更新健康记录
router.put('/:id', healthRecordController.updateHealthRecord);

// 删除健康记录
router.delete('/:id', healthRecordController.deleteHealthRecord);

// 获取健康指标历史
router.get('/metrics/history', healthRecordController.getHealthMetricsHistory);

// 添加健康指标记录
router.post('/metrics', healthRecordController.addHealthMetrics);

// 获取用药记录
router.get('/medications', healthRecordController.getMedicationRecords);

// 添加用药记录
router.post('/medications', healthRecordController.addMedicationRecord);

module.exports = router;
