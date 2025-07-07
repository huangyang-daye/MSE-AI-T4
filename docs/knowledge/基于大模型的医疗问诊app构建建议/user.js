const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用户注册
router.post('/register', userController.register);

// 用户登录
router.post('/login', userController.login);

// 获取用户信息
router.get('/profile', userController.getProfile);

// 更新用户信息
router.put('/profile', userController.updateProfile);

// 更新健康档案
router.put('/health-profile', userController.updateHealthProfile);

// 获取健康档案
router.get('/health-profile', userController.getHealthProfile);

module.exports = router;
