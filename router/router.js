const express = require('express');
const router = express();

const userController = require('../controller/user');

// 微信登录
router.get('/wx/login', (req, res) => {
  userController[req.path](req, res);
});

// 更新微信用户信息
router.post('/wx/update-user-info', async (req, res) => {
  userController[req.path](req, res);
});


module.exports = router;
