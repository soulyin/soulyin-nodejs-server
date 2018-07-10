'use strict';

/**
 * song controller
 */

const express = require('express');
const router = express.Router();

const songModel = require('../models/song');

// 获取歌词
router.get('/lyric', async (req, res) => {
  const id = req.query.id;
  try {
    const data = await songModel.getLyric(id);
    res.resSuccess(JSON.parse(data), '获取歌词成功');
  } catch (err) {
    res.resError(err);
  }
});

// 获取歌曲url
router.get('/music/url', async (req, res) => {
  const id = req.query.id;
  const br = req.query.br || 999000;
  try {
    const data = await songModel.getMusicUrl(id, br);
    res.resSuccess(JSON.parse(data), '获取歌曲地址成功');
  } catch (err) {
    res.resError(err);
  }
});

// 搜索歌曲
router.get('/search', async (req, res) => {
  const keywords = req.query.keywords;
  const type = req.query.type || 1;
  const limit = req.query.limit || 30;
  const offset = req.query.offset || 0;
  try {
    const data = await songModel.searchSong(keywords, type, limit, offset);
    return res.resSuccess(JSON.parse(data), '搜索歌曲成功');
  } catch (err) {
    return res.resError(err);
  }
});

// 获取歌曲详情
router.get('/detail', async (req, res) => {
  const ids = req.query.ids;
  try {
    const data = await songModel.getSongDetail(ids);
    return res.resSuccess(JSON.parse(data), '获取歌曲详情成功');
  } catch (err) {
    return res.resError(err);
  }
});
module.exports = router;
