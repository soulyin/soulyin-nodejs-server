'use strict';

const jwt = require('jsonwebtoken');
const UserModel = require('../models/users');
// const uuid = require('uuid')
// const serverInfo = require('../config/server')

const _secret = 'soulyin';
let _authInfo = null;

const authApp = {
  /**
   * 初始化：将“加了密”的token“解密”成对象形式的信息
   */
  async init(req, res, next) {
    if (req.path.indexOf('login') !== -1) {
      return next();
    }
    let token;
    token = req.query.token || req.body.token;
    req._authInfo = authApp.verify(token);
    // 将用户的信息挂载到req对象下面
    if (_authInfo) {
      const userInfo = await UserModel.findUserById(_authInfo.uid);
      if (userInfo.length === 0) {
        delete req._authInfo;
      }
    }
    return next();
  },
  /**
   * 生成授权令牌
   * @param {Number} uid 用户id
   */
  generateToken(uid) {
    const info = {
      uid: uid,
      expiresIn: '7d'
    };
    const token = jwt.sign(info, _secret);
    return token;
  },
  /**
   * 验证授权令牌
   * @param {String} token 授权令牌
   * @return Object tokeninfo，令牌中携带的信息对象
   */
  verify(token) {
    let decoded = false;
    try {
      decoded = jwt.verify(token, _secret);
    } catch (e) {
      decoded = false;
    }
    return decoded;
  },
  /**
   * 获取认证信息
   * @return Object 用户认证信息，包含uid等
   */
  authInfo() {
    return _authInfo;
  }
};

module.exports = authApp;
