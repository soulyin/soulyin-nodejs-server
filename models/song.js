const rp = require('request-promise');
const songBaseUrl = 'http://122.152.227.45:4000';
const get = 'GET',
  post = 'POST';

// 获取歌词
exports.getLyric = async id => {
  try {
    return await rp({
      method: get,
      url: songBaseUrl + '/lyric',
      qs: {
        id
      }
    });
    return data;
  } catch (err) {
    throw err;
  }
};

// 获取音乐地址
exports.getMusicUrl = async (id, br) => {
  try {
    return await rp({
      method: get,
      url: songBaseUrl + '/music/url',
      qs: {
        id,
        br
      }
    });
  } catch (err) {
    throw err;
  }
};

// 搜索歌曲
exports.searchSong = async (keywords, type, limit, offset) => {
  try {
    return await rp({
      method: get,
      url: songBaseUrl + '/search',
      qs: {
        keywords,
        type,
        limit,
        offset
      }
    });
  } catch (err) {
    throw err;
  }
};

// 获取歌曲详情
exports.getSongDetail = async ids => {
  try {
    return await rp({
      method: get,
      url: songBaseUrl + '/song/detail',
      qs: {
        ids
      }
    });
  } catch (err) {
    throw err;
  }
};

exports.search = async () => {};
