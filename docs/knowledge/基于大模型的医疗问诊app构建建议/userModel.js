const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 用户模型
const userSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  birthdate: {
    type: Date
  },
  healthProfile: {
    basicInfo: {
      height: Number, // 身高(cm)
      weight: Number, // 体重(kg)
      bloodType: String // 血型
    },
    medicalHistory: {
      allergies: [String], // 过敏史
      allergiesDetail: String, // 过敏详情
      chronicDiseases: [String], // 慢性病史
      chronicDiseasesDetail: String, // 慢性病详情
      familyHistory: [String], // 家族病史
      currentMedications: String // 当前用药情况
    },
    lifeStyle: {
      smokingStatus: {
        type: String,
        enum: ['never', 'former', 'occasional', 'regular']
      }, // 吸烟情况
      drinkingStatus: {
        type: String,
        enum: ['never', 'occasional', 'regular', 'heavy']
      }, // 饮酒情况
      exerciseFrequency: {
        type: String,
        enum: ['rarely', 'occasionally', 'regularly', 'frequently']
      }, // 运动频率
      dietHabits: String // 饮食习惯
    }
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

const User = mongoose.model('User', userSchema);

module.exports = {
  User
};
