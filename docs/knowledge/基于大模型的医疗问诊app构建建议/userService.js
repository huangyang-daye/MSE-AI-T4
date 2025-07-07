const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const logger = require('../utils/logger');

/**
 * 创建新用户
 */
exports.createUser = async (userData) => {
  try {
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // 创建用户
    const user = new User({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
      gender: userData.gender,
      birthdate: userData.birthdate,
      healthProfile: {
        basicInfo: {},
        medicalHistory: {},
        lifeStyle: {}
      }
    });
    
    await user.save();
    return user;
  } catch (error) {
    logger.error(`创建用户失败: ${error.message}`);
    throw error;
  }
};

/**
 * 根据手机号查找用户
 */
exports.findUserByPhone = async (phone) => {
  try {
    return await User.findOne({ phone });
  } catch (error) {
    logger.error(`查找用户失败: ${error.message}`);
    throw error;
  }
};

/**
 * 根据ID查找用户
 */
exports.getUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    logger.error(`查找用户失败: ${error.message}`);
    throw error;
  }
};

/**
 * 验证用户凭据并生成JWT
 */
exports.authenticateUser = async (phone, password) => {
  try {
    // 查找用户
    const user = await User.findOne({ phone });
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('密码错误');
    }
    
    // 生成JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    return { user, token };
  } catch (error) {
    logger.error(`用户认证失败: ${error.message}`);
    throw error;
  }
};

/**
 * 更新用户信息
 */
exports.updateUser = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    return user;
  } catch (error) {
    logger.error(`更新用户信息失败: ${error.message}`);
    throw error;
  }
};

/**
 * 更新健康档案
 */
exports.updateHealthProfile = async (userId, healthProfileData) => {
  try {
    // 构建健康档案更新对象
    const healthProfileUpdate = {};
    
    // 基本信息
    if (healthProfileData.height || healthProfileData.weight || healthProfileData.bloodType) {
      healthProfileUpdate['healthProfile.basicInfo'] = {
        height: healthProfileData.height,
        weight: healthProfileData.weight,
        bloodType: healthProfileData.bloodType
      };
    }
    
    // 病史信息
    if (healthProfileData.allergies || healthProfileData.chronicDiseases || 
        healthProfileData.familyHistory || healthProfileData.currentMedications) {
      healthProfileUpdate['healthProfile.medicalHistory'] = {
        allergies: healthProfileData.allergies || [],
        allergiesDetail: healthProfileData.allergiesDetail,
        chronicDiseases: healthProfileData.chronicDiseases || [],
        chronicDiseasesDetail: healthProfileData.chronicDiseasesDetail,
        familyHistory: healthProfileData.familyHistory || [],
        currentMedications: healthProfileData.currentMedications
      };
    }
    
    // 生活习惯
    if (healthProfileData.smokingStatus || healthProfileData.drinkingStatus || 
        healthProfileData.exerciseFrequency || healthProfileData.dietHabits) {
      healthProfileUpdate['healthProfile.lifeStyle'] = {
        smokingStatus: healthProfileData.smokingStatus,
        drinkingStatus: healthProfileData.drinkingStatus,
        exerciseFrequency: healthProfileData.exerciseFrequency,
        dietHabits: healthProfileData.dietHabits
      };
    }
    
    // 更新用户健康档案
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: healthProfileUpdate },
      { new: true }
    );
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    return user.healthProfile;
  } catch (error) {
    logger.error(`更新健康档案失败: ${error.message}`);
    throw error;
  }
};

/**
 * 获取健康档案
 */
exports.getHealthProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    return user.healthProfile;
  } catch (error) {
    logger.error(`获取健康档案失败: ${error.message}`);
    throw error;
  }
};
