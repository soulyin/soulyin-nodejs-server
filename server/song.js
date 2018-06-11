const secret = require('../config/secret');
const DB = require('../db');
const rp = require('request-promise');
const crypto = require('crypto');
const minim = require('../util/minim');

const { createWebAPIRequest } = require('../util/util');

const songServer = {};

songServer['/song/lyric'] = async function(req, res) {
  const cookie = req.get('Cookie') ? req.get('Cookie') : '';
  const data = {};
  const id = req.query.id;
  try {
    const { body: lyric } = await createWebAPIRequest(
      'music.163.com',
      '/weapi/song/lyric?os=osx&id=' + id + '&lv=-1&kv=-1&tv=-1',
      'POST',
      data,
      cookie
    );
    return lyric;
  } catch (err) {
    throw new Error(err.message);
  }
};

songServer['/song/music/url'] = async function(req, res) {
  const id = req.query.id;
  const br = req.query.br || 999000;
  const data = {
    ids: [id],
    br: br,
    csrf_token: ''
  };
  const cookie = req.get('Cookie') ? req.get('Cookie') : '';
  try {
    const { body: songUrl } = await createWebAPIRequest(
      'music.163.com',
      '/weapi/song/enhance/player/url',
      'POST',
      data,
      cookie
    );
    return songUrl;
  } catch (err) {
    throw new Error(err.message);
  }
};

songServer['/song/search'] = async function(req, res) {
  const cookie = req.get('Cookie') ? req.get('Cookie') : '';
  const keywords = req.query.keywords;
  const type = req.query.type || 1;
  const limit = req.query.limit || 30;
  const offset = req.query.offset || 0;
  // *(type)* 搜索单曲(1)，歌手(100)，专辑(10)，歌单(1000)，用户(1002)
  const data = {
    csrf_token: '',
    limit,
    type,
    s: keywords,
    offset
  };
  try {
    const { body: list } = await createWebAPIRequest(
      'music.163.com',
      '/weapi/search/get',
      'POST',
      data,
      cookie
    );
    return list;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = songServer;
