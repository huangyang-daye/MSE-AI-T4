const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 健康记录模型
const healthRecordSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'ConsultationSession'
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  mainSymptoms: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  recommendations: {
    type: String
  },
  medications: [{
    name: String,
    dosage: String,
    purpose: String
  }],
  status: {
    type: String,
    enum: ['待观察', '已恢复', '持续观察', '需复诊'],
    default: '待观察'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 健康指标模型
const healthMetricsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  weight: {
    type: Number
  },
  bloodPressure: {
    type: String
  },
  heartRate: {
    type: Number
  },
  bloodSugar: {
    type: Number
  },
  otherMetrics: {
    type: Map,
    of: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 用药记录模型
const medicationRecordSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medication: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  endDate: {
    type: Date
  },
  purpose: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
const HealthMetrics = mongoose.model('HealthMetrics', healthMetricsSchema);
const MedicationRecord = mongoose.model('MedicationRecord', medicationRecordSchema);

module.exports = {
  HealthRecord,
  HealthMetrics,
  MedicationRecord
};
