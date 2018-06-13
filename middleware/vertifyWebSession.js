/**
 * 验证 web 端的 session
 */

const DB = require('../db');
const res = require('./res');

module.exports = function(sessionStore) {
  return async function(req, res, next) {
    const sid = req.session.id;
    sessionStore.get(sid, (err, session) => {
      if (err) {
        console.log(err);
        return;
      }
      var a = session;
    });
  };
};
