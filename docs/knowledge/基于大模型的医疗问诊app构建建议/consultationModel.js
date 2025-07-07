const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 问诊会话模型
const consultationSessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initialSymptoms: {
    type: String
  },
  messages: [{
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  diagnosis: {
    symptoms: [String],
    possibleConditions: [{
      name: String,
      probability: String,
      description: String
    }],
    recommendations: [{
      type: String,
      content: String,
      urgency: String
    }],
    medications: [{
      name: String,
      usage: String,
      purpose: String,
      notes: String
    }],
    warningSymptoms: [String]
  },
  medicationAdvice: {
    medications: [{
      name: String,
      category: String,
      usage: String,
      purpose: String,
      sideEffects: String,
      contraindications: String,
      notes: String
    }],
    generalAdvice: String,
    disclaimer: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
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

const ConsultationSession = mongoose.model('ConsultationSession', consultationSessionSchema);

module.exports = {
  ConsultationSession
};
