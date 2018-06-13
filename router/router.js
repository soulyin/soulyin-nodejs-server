const express = require('express');
const router = express();

const userController = require('../controller/user');
const songController = require('../controller/song');

// 用户注册（网页）
router.post('/sy/web/register', (req, res) => {
  userController[req.path](req, res);
});

// 微信登录
router.get('/wx/login', (req, res) => {
  userController[req.path](req, res);
});



// 更新微信用户信息
router.post('/wx/update-user-info', async (req, res) => {
  userController[req.path](req, res);
});

// 获取歌词
router.get('/song/lyric', async (req, res) => {
  songController[req.path](req, res);
})

// 获取歌曲url
router.get('/song/music/url', async (req, res) => {
  songController[req.path](req, res);
})

// 搜索歌曲
router.get('/song/search', async (req, res) => {
  songController[req.path](req, res);
})


module.exports = router;
