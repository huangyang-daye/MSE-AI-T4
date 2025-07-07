const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * 用户注册
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, gender, birthdate } = req.body;
    
    // 验证输入
    if (!phone || !password) {
      return res.status(400).json({ message: '手机号和密码不能为空' });
    }
    
    // 检查用户是否已存在
    const existingUser = await userService.findUserByPhone(phone);
    if (existingUser) {
      return res.status(409).json({ message: '该手机号已注册' });
    }
    
    // 创建新用户
    const user = await userService.createUser({
      name,
      email,
      phone,
      password,
      gender,
      birthdate
    });
    
    res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    logger.error(`用户注册失败: ${error.message}`);
    next(error);
  }
};

/**
 * 用户登录
 */
exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    
    // 验证输入
    if (!phone || !password) {
      return res.status(400).json({ message: '手机号和密码不能为空' });
    }
    
    // 验证用户凭据
    const { user, token } = await userService.authenticateUser(phone, password);
    
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          userId: user._id,
          name: user.name,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    logger.error(`用户登录失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取用户信息
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        birthdate: user.birthdate
      }
    });
  } catch (error) {
    logger.error(`获取用户信息失败: ${error.message}`);
    next(error);
  }
};

/**
 * 更新用户信息
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const { name, email, gender, birthdate } = req.body;
    
    const updatedUser = await userService.updateUser(userId, {
      name,
      email,
      gender,
      birthdate
    });
    
    res.status(200).json({
      success: true,
      data: {
        userId: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        birthdate: updatedUser.birthdate
      }
    });
  } catch (error) {
    logger.error(`更新用户信息失败: ${error.message}`);
    next(error);
  }
};

/**
 * 更新健康档案
 */
exports.updateHealthProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    const healthProfileData = req.body;
    
    const updatedProfile = await userService.updateHealthProfile(userId, healthProfileData);
    
    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    logger.error(`更新健康档案失败: ${error.message}`);
    next(error);
  }
};

/**
 * 获取健康档案
 */
exports.getHealthProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // 从JWT中获取
    
    const healthProfile = await userService.getHealthProfile(userId);
    
    res.status(200).json({
      success: true,
      data: healthProfile
    });
  } catch (error) {
    logger.error(`获取健康档案失败: ${error.message}`);
    next(error);
  }
};
