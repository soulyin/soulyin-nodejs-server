'use strict';

/**
 * 验证 web 端的 session
 */

const DB = require('../db');
const res = require('./res');

module.exports = function(sessionStore) {
  return async function(req, res, next) {
    if (req.path.indexOf('/wx') !== -1) {
      return next();
    }
    const sid = req.session.id;
    sessionStore.get(sid, (err, session) => {
      if (err) {
        return res.resError(err);
      }
      if (!session) {
        return res.resError('无权限访问');
      }
      next();
    });
  };
};
