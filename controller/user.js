const userServer = require('../server/user');
const userValidator = require('../validator/user');

const userController = {};

userController['/wx/login'] = async function(req, res) {
  const { code } = req.query;
  if (!userValidator[req.path](req.query)) {
    return res.resError('code 参数有误');
  }
  try {
    const skey = await userServer[req.path](req, res);
    res.resSuccess(skey, '登录成功');
  } catch (err) {
    res.resError(err.message);
  }
};

userController['/wx/update-user-info'] = async function(req, res) {
  if (!userValidator[req.path](req.body)) {
    return res.resError('参数有误');
  }
  try {
    await userServer[req.path](req, res);
    res.resSuccess({}, '更新用户微信信息成功');
  } catch (err) {
    res.resError(err.message);
  }
};

module.exports = userController;
