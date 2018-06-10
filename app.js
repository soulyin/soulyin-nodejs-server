const express = require('express');
const apicache = require('apicache');
const path = require('path');
const helmet = require('helmet');
const res = require('./middleware/res');
const bodyParser = require('body-parser');
const vertifyWxSession = require('./middleware/verifyWxSession');
// const session = require('express-session');
// const FileStore = require('session-file-store')(session);
const app = express();
let cache = apicache.middleware;
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(res());

// 跨域设置
app.all('*', function(req, res, next) {
  if (req.path !== '/' && !req.path.includes('.')) {
    res.header('Access-Control-Allow-Credentials', true);
    // 这里获取 origin 请求头 而不是用 *
    res.header('Access-Control-Allow-Origin', req.headers['origin'] || '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('Content-Type', 'application/json;charset=utf-8');
  }
  next();
});

const onlyStatus200 = (req, res) => res.statusCode === 200;

app.use(cache('2 minutes', onlyStatus200));

app.use(express.static(path.resolve(__dirname, 'public')));

app.use(function(req, res, next) {
  const proxy = req.query.proxy;
  if (proxy) {
    req.headers.cookie = req.headers.cookie + `__proxy__${proxy}`;
  }
  next();
});

// 验证微信 session
app.use(vertifyWxSession());

// 微信
app.use('/wx', require('./router/wx'));

// 获取歌词
app.use('/lyric', require('./router/lyric'));

// 获取音乐 url
app.use('/music/url', require('./router/musicUrl'));

// 搜索
app.use('/search', require('./router/search'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server running @ http://localhost:${port}`);
});

module.exports = app;
