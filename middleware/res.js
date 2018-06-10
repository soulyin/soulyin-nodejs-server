/**
 * 响应中间件
 */
module.exports = function() {
  return function(req, res, next) {
    res.resSuccess = function(data = {}, message = '操作成功') {
      res.json({ code: 1, message, data: data });
    };
    res.resError = function(err, message = '操作失败') {
      res.json({ code: 0, error: err, message });
    };
    next();
  };
};
