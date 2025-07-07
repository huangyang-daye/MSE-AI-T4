const { HealthRecord, HealthMetrics, MedicationRecord } = require('../models/healthRecordModel');
const logger = require('../utils/logger');

/**
 * 获取用户的健康记录列表
 */
exports.getHealthRecords = async (userId, startDate, endDate) => {
  try {
    let query = { userId };
    
    // 添加日期过滤
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const records = await HealthRecord.find(query)
      .sort({ date: -1 })
      .lean();
    
    return records;
  } catch (error) {
    logger.error(`获取健康记录列表失败: ${error.message}`);
    throw error;
  }
};

/**
 * 获取单个健康记录详情
 */
exports.getHealthRecordById = async (userId, recordId) => {
  try {
    const record = await HealthRecord.findOne({
      _id: recordId,
      userId
    }).lean();
    
    return record;
  } catch (error) {
    logger.error(`获取健康记录详情失败: ${error.message}`);
    throw error;
  }
};

/**
 * 创建新的健康记录
 */
exports.createHealthRecord = async (userId, recordData) => {
  try {
    const healthRecord = new HealthRecord({
      userId,
      date: recordData.date || new Date(),
      mainSymptoms: recordData.mainSymptoms,
      diagnosis: recordData.diagnosis,
      recommendations: recordData.recommendations,
      medications: recordData.medications,
      status: recordData.status || '待观察'
    });
    
    await healthRecord.save();
    return healthRecord;
  } catch (error) {
    logger.error(`创建健康记录失败: ${error.message}`);
    throw error;
  }
};

/**
 * 更新健康记录
 */
exports.updateHealthRecord = async (userId, recordId, updateData) => {
  try {
    const record = await HealthRecord.findOneAndUpdate(
      { _id: recordId, userId },
      { $set: updateData },
      { new: true }
    );
    
    return record;
  } catch (error) {
    logger.error(`更新健康记录失败: ${error.message}`);
    throw error;
  }
};

/**
 * 删除健康记录
 */
exports.deleteHealthRecord = async (userId, recordId) => {
  try {
    const result = await HealthRecord.findOneAndDelete({
      _id: recordId,
      userId
    });
    
    return result;
  } catch (error) {
    logger.error(`删除健康记录失败: ${error.message}`);
    throw error;
  }
};

/**
 * 获取健康指标历史
 */
exports.getHealthMetricsHistory = async (userId, metricType, startDate, endDate) => {
  try {
    let query = { userId };
    
    // 添加指标类型过滤
    if (metricType) {
      query.metricType = metricType;
    }
    
    // 添加日期过滤
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const metrics = await HealthMetrics.find(query)
      .sort({ date: -1 })
      .lean();
    
    return metrics;
  } catch (error) {
    logger.error(`获取健康指标历史失败: ${error.message}`);
    throw error;
  }
};

/**
 * 添加健康指标记录
 */
exports.addHealthMetrics = async (userId, metricsData) => {
  try {
    const healthMetrics = new HealthMetrics({
      userId,
      date: metricsData.date || new Date(),
      weight: metricsData.weight,
      bloodPressure: metricsData.bloodPressure,
      heartRate: metricsData.heartRate,
      bloodSugar: metricsData.bloodSugar,
      otherMetrics: metricsData.otherMetrics
    });
    
    await healthMetrics.save();
    return healthMetrics;
  } catch (error) {
    logger.error(`添加健康指标记录失败: ${error.message}`);
    throw error;
  }
};

/**
 * 获取用药记录
 */
exports.getMedicationRecords = async (userId, startDate, endDate) => {
  try {
    let query = { userId };
    
    // 添加日期过滤
    if (startDate || endDate) {
      query.$or = [];
      
      // 开始日期在范围内
      if (startDate && endDate) {
        query.$or.push({
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
      } else if (startDate) {
        query.$or.push({
          startDate: { $gte: new Date(startDate) }
        });
      } else if (endDate) {
        query.$or.push({
          startDate: { $lte: new Date(endDate) }
        });
      }
      
      // 结束日期在范围内
      if (startDate && endDate) {
        query.$or.push({
          endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
      } else if (startDate) {
        query.$or.push({
          endDate: { $gte: new Date(startDate) }
        });
      } else if (endDate) {
        query.$or.push({
          endDate: { $lte: new Date(endDate) }
        });
      }
      
      // 跨越整个范围
      if (startDate && endDate) {
        query.$or.push({
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        });
      }
    }
    
    const medications = await MedicationRecord.find(query)
      .sort({ startDate: -1 })
      .lean();
    
    return medications;
  } catch (error) {
    logger.error(`获取用药记录失败: ${error.message}`);
    throw error;
  }
};

/**
 * 添加用药记录
 */
exports.addMedicationRecord = async (userId, medicationData) => {
  try {
    const medicationRecord = new MedicationRecord({
      userId,
      medication: medicationData.medication,
      dosage: medicationData.dosage,
      frequency: medicationData.frequency,
      startDate: medicationData.startDate || new Date(),
      endDate: medicationData.endDate,
      purpose: medicationData.purpose
    });
    
    await medicationRecord.save();
    return medicationRecord;
  } catch (error) {
    logger.error(`添加用药记录失败: ${error.message}`);
    throw error;
  }
};
