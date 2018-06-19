'use strict';

/**
 * 验证微信登录的 session
 */

const DB = require('../db');
const res = require('./res');

module.exports = function() {
  return async function(req, res, next) {
    if (req.path.indexOf('login') !== -1) {
      return next();
    }
    let skey = '';
    if (req.method === 'GET') {
      skey = req.query.skey;
    } else if (req.method === 'POST') {
      skey = req.body.skey;
    }
    // 微信登录
    if (skey) {
      let userInfo;
      try {
        userInfo = await DB.instance('r').query(
          `select * from users where wx_skey = "${skey}"`
        );
        // 验证通过
        if (userInfo.length > 0 && userInfo[0].wx_skey === skey) {
          req.openid = userInfo[0].openid;
          next();
        }
      } catch (err) {
        res.resError(err.message);
      }
      // 非微信登录
    } else {
      return next();
    }
  };
};
