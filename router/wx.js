const express = require('express');
const router = express();
const rp = require('request-promise');
// 一个对象，包含微信小程序的 appid 和 appSceret
const secret = require('../config/secret');
const crypto = require('crypto');
const DB = require('../db');
// 有道理
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

// 微信登录
router.get('/login', async (req, res) => {
  const { code } = req.query;
  const { skey, openid } = await getSessionKey(
    code,
    secret.appid,
    secret.appSecret
  );
  if (skey) {
    try {
      const userInfo = await DB.instance('r').findOne('users', { openid });
      // 注册
      if (userInfo.length === 0) {
        const result = await DB.instance('w').insert('users', { wx_skey: skey, openid });
      // 登录
      } else {
        const result = await DB.instance('w').update(
          'users',
          {
            wx_skey: skey
          },
          {
            openid
          }
        );
      }
      res.resSuccess(skey, '登录成功');
    } catch (err) {
      res.resError(err);
    }
  } else {
    res.resError('获取 session_key, openid 失败');
  }
});

// 更新微信用户信息
router.post('/update-user-info', async (req, res) => {
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
    const result = await DB.instance('w').update(
      'users',
      {
        wx_avatar_url: avatarUrl,
        wx_city: city,
        wx_country: country,
        wx_gender: gender,
        wx_language: language,
        wx_nickName: nickName,
        wx_province: province
      },
      {
        openid
      }
    );
    res.resSuccess({}, '更新用户微信信息成功');
  } catch (err) {
    res.resError(err.message);
  }
});

module.exports = router;
