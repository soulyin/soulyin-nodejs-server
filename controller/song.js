const songServer = require('../server/song');
const songValidator = require('../validator/song');

const songController = {};

songController['/song/lyric'] = async function(req, res) {
  // if (!userValidator[req.path](req.query)) {
  //   return res.resError('id 参数有误');
  // }
  try {
    const data = await songServer[req.path](req, res);
    res.resSuccess(data, '获取歌词成功');
  } catch (err) {
    res.resError(err.message);
  }
};

songController['/song/music/url'] = async function(req, res) {
  // if (!userValidator[req.path](req.query)) {
  //   return res.resError('参数有误');
  // }
  try {
    const data = await songServer[req.path](req, res);
    res.resSuccess(data, '获取歌曲url成功');
  } catch (err) {
    res.resError(err.message);
  }
};

songController['/song/search'] = async function(req, res) {
  // if (!userValidator[req.path](req.query)) {
  //   return res.resError('参数有误');
  // }
  try {
    const data = await songServer[req.path](req, res);
    res.resSuccess(data, '搜索歌曲成功');
  } catch (err) {
    res.resError(err.message);
  }
};

module.exports = songController;
