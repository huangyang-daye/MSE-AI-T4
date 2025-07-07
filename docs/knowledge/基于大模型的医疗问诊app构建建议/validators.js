const Joi = require('joi');

// 用户注册验证
exports.validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().allow(''),
    email: Joi.string().email().allow(''),
    phone: Joi.string().pattern(/^1\d{10}$/).required().messages({
      'string.pattern.base': '手机号格式不正确，请输入11位手机号'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': '密码长度不能少于8个字符'
    }),
    gender: Joi.string().valid('male', 'female', 'other').allow(''),
    birthdate: Joi.date().allow('')
  });
  
  return schema.validate(data);
};

// 用户登录验证
exports.validateLogin = (data) => {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^1\d{10}$/).required().messages({
      'string.pattern.base': '手机号格式不正确，请输入11位手机号'
    }),
    password: Joi.string().required()
  });
  
  return schema.validate(data);
};

// 健康档案验证
exports.validateHealthProfile = (data) => {
  const schema = Joi.object({
    height: Joi.number().min(50).max(250).allow(''),
    weight: Joi.number().min(20).max(300).allow(''),
    bloodType: Joi.string().valid('A', 'B', 'AB', 'O', 'unknown').allow(''),
    allergies: Joi.array().items(Joi.string()),
    allergiesDetail: Joi.string().allow(''),
    chronicDiseases: Joi.array().items(Joi.string()),
    chronicDiseasesDetail: Joi.string().allow(''),
    familyHistory: Joi.array().items(Joi.string()),
    currentMedications: Joi.string().allow(''),
    smokingStatus: Joi.string().valid('never', 'former', 'occasional', 'regular').allow(''),
    drinkingStatus: Joi.string().valid('never', 'occasional', 'regular', 'heavy').allow(''),
    exerciseFrequency: Joi.string().valid('rarely', 'occasionally', 'regularly', 'frequently').allow(''),
    dietHabits: Joi.string().allow('')
  });
  
  return schema.validate(data);
};

// 问诊消息验证
exports.validateConsultationInput = (data) => {
  const schema = Joi.object({
    sessionId: Joi.string().when('initialSymptoms', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    message: Joi.string().max(1000).when('initialSymptoms', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    initialSymptoms: Joi.string().max(1000).optional(),
    userInfo: Joi.object().optional()
  });
  
  return schema.validate(data);
};

// 健康记录验证
exports.validateHealthRecord = (data) => {
  const schema = Joi.object({
    date: Joi.date().default(Date.now),
    mainSymptoms: Joi.string().required(),
    diagnosis: Joi.string().required(),
    recommendations: Joi.string().allow(''),
    medications: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().required(),
        purpose: Joi.string().allow('')
      })
    ),
    status: Joi.string().valid('待观察', '已恢复', '持续观察', '需复诊').default('待观察'),
    notes: Joi.string().allow('')
  });
  
  return schema.validate(data);
};

// 健康指标验证
exports.validateHealthMetrics = (data) => {
  const schema = Joi.object({
    date: Joi.date().default(Date.now),
    weight: Joi.number().min(20).max(300).allow(null),
    bloodPressure: Joi.string().allow(''),
    heartRate: Joi.number().min(30).max(220).allow(null),
    bloodSugar: Joi.number().min(1).max(30).allow(null),
    otherMetrics: Joi.object().optional()
  });
  
  return schema.validate(data);
};

// 用药记录验证
exports.validateMedicationRecord = (data) => {
  const schema = Joi.object({
    medication: Joi.string().required(),
    dosage: Joi.string().required(),
    frequency: Joi.string().required(),
    startDate: Joi.date().default(Date.now),
    endDate: Joi.date().greater(Joi.ref('startDate')).allow(null),
    purpose: Joi.string().allow('')
  });
  
  return schema.validate(data);
};
