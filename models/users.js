/**
 * table users model
 */
const DB = require('../db');
const users = 'users';
const minim = require('../util/minim');

// 添加用户
exports.addUser = async (username, password) => {
  try {
    const userInfo = await DB.instance('w').insert(users, {
      username,
      password
    });
    return userInfo;
  } catch (err) {
    throw err;
  }
};

// 添加 wx 用户
exports.addWxUser = async (wx_skey, openid) => {
  try {
    const result = await DB.instance('w').insert('users', {
      wx_skey,
      openid,
      username: minim.unix(),
      password: '123456'
    });
    return userInfo;
  } catch (err) {
    throw err;
  }
};

// 查找用户（用户名和密码）
exports.findUser = async (username, password) => {
  try {
    const userInfo = await DB.instance('w').findOne(users, {
      username,
      password
    });
    return userInfo;
  } catch (err) {
    throw err;
  }
};

// 查找用户（openid）
exports.findUserByOpenid = async openid => {
  try {
    const userInfo = await DB.instance('w').findOne(users, {
      openid
    });
    return userInfo;
  } catch (err) {
    throw err;
  }
};

// 查找用户（id）
exports.findUserById = async id => {
  try {
    const userInfo = await DB.instance('w').findOne(users, {
      id
    });
    return userInfo;
  } catch (err) {
    throw err;
  }
};

// 更新用户微信登录生成的 skey
exports.updateUserSkey = async (wx_skey, openid) => {
  try {
    const userInfo = await DB.instance('w').update(
      users,
      {
        wx_skey
      },
      {
        openid
      }
    );
    return userInfo;
  } catch (err) {
    throw err;
  }
};

// 更新微信用户信息
exports.updateWxUserInfo = async userInfo => {
  try {
    const result = await DB.instance('w').update(
      'users',
      {
        wx_avatar_url: userInfo.avatarUrl,
        wx_city: userInfo.city,
        wx_country: userInfo.country,
        wx_gender: userInfo.gender,
        wx_language: userInfo.language,
        wx_nickName: userInfo.nickName,
        wx_province: userInfo.province
      },
      {
        openid: userInfo.openid
      }
    );
    return result;
  } catch (err) {
    throw err;
  }
};

// 获取用户的信息 by id
exports.getUserInfoById = async id => {
  try {
    const result = await DB.instance('r').findOne('users', {
      id
    });
    return result;
  } catch (err) {
    throw err;
  }
};
