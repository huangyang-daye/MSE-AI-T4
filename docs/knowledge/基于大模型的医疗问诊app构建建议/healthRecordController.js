const healthRecordService = require('../services/healthRecordService');
const logger = require('../utils/logger');

/**
 * 获取用户的健康记录列表
 */
exports.getHealthRecords = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const { startDate, endDate } = req.query;
    
    const records = await healthRecordService.getHealthRecords(userId, startDate, endDate);
    
    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    logger.error(`获取健康记录列表失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取单个健康记录详情
 */
exports.getHealthRecordById = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const recordId = req.params.id;
    
    const record = await healthRecordService.getHealthRecordById(userId, recordId);
    
    if (!record) {
      return res.status(404).json({ message: '健康记录不存在' });
    }
    
    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    logger.error(`获取健康记录详情失败: ${error.message}`);
    next(error);
  }
};

/**
 * 创建新的健康记录
 */
exports.createHealthRecord = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const recordData = req.body;
    
    const newRecord = await healthRecordService.createHealthRecord(userId, recordData);
    
    res.status(201).json({
      success: true,
      data: newRecord
    });
  } catch (error) {
    logger.error(`创建健康记录失败: ${error.message}`);
    next(error);
  }
};

/**
 * 更新健康记录
 */
exports.updateHealthRecord = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const recordId = req.params.id;
    const updateData = req.body;
    
    const updatedRecord = await healthRecordService.updateHealthRecord(userId, recordId, updateData);
    
    if (!updatedRecord) {
      return res.status(404).json({ message: '健康记录不存在' });
    }
    
    res.status(200).json({
      success: true,
      data: updatedRecord
    });
  } catch (error) {
    logger.error(`更新健康记录失败: ${error.message}`);
    next(error);
  }
};

/**
 * 删除健康记录
 */
exports.deleteHealthRecord = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const recordId = req.params.id;
    
    const result = await healthRecordService.deleteHealthRecord(userId, recordId);
    
    if (!result) {
      return res.status(404).json({ message: '健康记录不存在' });
    }
    
    res.status(200).json({
      success: true,
      message: '健康记录已删除'
    });
  } catch (error) {
    logger.error(`删除健康记录失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取健康指标历史
 */
exports.getHealthMetricsHistory = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const { startDate, endDate, metricType } = req.query;
    
    const metricsHistory = await healthRecordService.getHealthMetricsHistory(
      userId, 
      metricType,
      startDate, 
      endDate
    );
    
    res.status(200).json({
      success: true,
      data: metricsHistory
    });
  } catch (error) {
    logger.error(`获取健康指标历史失败: ${error.message}`);
    next(error);
  }
};

/**
 * 添加健康指标记录
 */
exports.addHealthMetrics = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const metricsData = req.body;
    
    const newMetrics = await healthRecordService.addHealthMetrics(userId, metricsData);
    
    res.status(201).json({
      success: true,
      data: newMetrics
    });
  } catch (error) {
    logger.error(`添加健康指标记录失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取用药记录
 */
exports.getMedicationRecords = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const { startDate, endDate } = req.query;
    
    const medicationRecords = await healthRecordService.getMedicationRecords(
      userId,
      startDate,
      endDate
    );
    
    res.status(200).json({
      success: true,
      data: medicationRecords
    });
  } catch (error) {
    logger.error(`获取用药记录失败: ${error.message}`);
    next(error);
  }
};

/**
 * 添加用药记录
 */
exports.addMedicationRecord = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const medicationData = req.body;
    
    const newMedicationRecord = await healthRecordService.addMedicationRecord(userId, medicationData);
    
    res.status(201).json({
      success: true,
      data: newMedicationRecord
    });
  } catch (error) {
    logger.error(`添加用药记录失败: ${error.message}`);
    next(error);
  }
};
