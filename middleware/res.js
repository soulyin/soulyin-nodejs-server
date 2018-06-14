/**
 * 响应中间件
 */
module.exports = function() {
  return function(req, res, next) {
    res.resSuccess = function(data = {}, message = '操作成功') {
      return res.json({ code: 1, message, data: data });
    };
    res.resError = function(error, message = '操作失败') {
      // express-validator 验证出错时，传过来的 error 为一个对象
      // 使用 error.array() 方法可以列出验证出错的参数
      error = (error.array && error.array()) || error;
      return res.json({ code: 0, error, message });
    };
    next();
  };
};
