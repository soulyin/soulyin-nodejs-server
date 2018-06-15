'use strict';

/**
 * users controller
 */

const express = require('express');
const router = express.Router();
const UsersModel = require('../models/users');
const crypto = require('crypto');
const rp = require('request-promise');
const secret = require('../config/secret');

const {
  check,
  query,
  body,
  validationResult
} = require('express-validator/check');

async function encryptSha1(data) {
  return crypto
    .createHash('sha1')
    .update(data, 'utf8')
    .digest('hex');
}
// 从微信后端获取 session_key 和 openid
async function getSessionKey(code, appid, appSecret) {
  const opt = {
    method: 'GET',
    url: 'https://api.weixin.qq.com/sns/jscode2session',
    qs: {
      appid: appid,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code'
    },
    json: true
  };
  try {
    const { session_key, openid } = await rp(opt);
    if (session_key && openid) {
      const skey = await encryptSha1(session_key);
      return { openid, skey };
    } else {
      return '';
    }
  } catch (err) {
    throw new Error(err);
  }
}

// 注册
router.post(
  '/register',
  [
    check('username', '用户名必须为2~4个字符').isLength({ min: 2, max: 4 }),
    check('password', '密码必须为6~16个字符').isLength({ min: 6, max: 16 })
  ],
  async (req, res) => {
    try {
      validationResult(req).throw();
      const { username, password } = req.body;
      const userInfo = await UsersModel.addUser(username, password);
      res.resSuccess(userInfo, '注册成功');
    } catch (err) {
      return res.resError(err);
    }
  }
);

// 登录（web端）
router.post(
  '/web/login',
  [
    check('username', '用户名必须为2~10个字符').isLength({ min: 2, max: 10 }),
    check('password', '密码必须为6~16个字符').isLength({ min: 6, max: 16 })
  ],
  async (req, res) => {
    try {
      validationResult(req).throw();
      const { username, password } = req.body;
      const userInfo = await UsersModel.findUser(username, password);
      if (userInfo.length === 0) {
        return res.resError('用户名或密码错误');
      } else {
        delete userInfo[0].password;
        // 生成 session
        req.session.regenerate(function(err) {
          if (err) {
            return res.resError(err);
          }
          req.session.loginUser = userInfo[0].username;
          return res.resSuccess(userInfo, '登录成功');
        });
      }
    } catch (err) {
      return res.resError(err);
    }
  }
);

// 登录（wx端）
router.post('/wx/login', async (req, res) => {
  const { code } = req.body;
  const { skey, openid } = await getSessionKey(
    code,
    secret.appid,
    secret.appSecret
  );
  if (skey) {
    const userInfo = await UsersModel.findUserByOpenid(openid);
    // 注册
    let result;
    if (userInfo.length === 0) {
      result = await UsersModel.addWxUser(skey, openid);
      // 登录
    } else {
      result = await UsersModel.updateUserSkey(skey, openid);
    }
    res.resSuccess(skey, '微信登录成功');
  } else {
    res.resError(new Error('获取 session_key, openid 失败'));
  }
});

// 更新微信用户信息
router.post('/wx/update-user-info', async (req, res) => {
  const {
    avatarUrl,
    city,
    country,
    gender,
    language,
    nickName,
    province
  } = req.body;
  const openid = req.openid;
  try {
    const result = await UsersModel.updateWxUserInfo({
      wx_avatar_url: avatarUrl,
      wx_city: city,
      wx_country: country,
      wx_gender: gender,
      wx_language: language,
      wx_nickName: nickName,
      wx_province: province,
      openid
    });
    res.resSuccess(result, '更新微信用户信息成功');
  } catch (err) {
    res.resError(err);
  }
});

module.exports = router;
