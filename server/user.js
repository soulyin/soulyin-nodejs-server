const secret = require('../config/secret');
const DB = require('../db');
const rp = require('request-promise');
const crypto = require('crypto');
const minim = require('../util/minim');

const userServer = {};

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

userServer['/wx/login'] = async function(req, res) {
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
      let result;
      if (userInfo.length === 0) {
        result = await DB.instance('w').insert('users', {
          wx_skey: skey,
          openid,
          username: 'soulyin' + minim.unix()
        });
        // 登录
      } else {
        result = await DB.instance('w').update(
          'users',
          {
            wx_skey: skey
          },
          {
            openid
          }
        );
      }
      return skey;
    } catch (err) {
      throw new Error(err.message);
    }
  } else {
    throw new Error('获取 session_key, openid 失败');
  }
};

userServer['/wx/update-user-info'] = async function(req, res) {
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
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = userServer;