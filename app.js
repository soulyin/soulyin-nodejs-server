const express = require('express');
const apicache = require('apicache');
const path = require('path');
const helmet = require('helmet');
const res = require('./middleware/res');
const bodyParser = require('body-parser');
const vertifyWxSession = require('./middleware/verifyWxSession');
const session = require('express-session');

const app = express();
let cache = apicache.middleware;
app.use(helmet());

// post 请求参数解析中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 响应数据中间件
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

// proxy
app.use(function(req, res, next) {
  const proxy = req.query.proxy;
  if (proxy) {
    req.headers.cookie = req.headers.cookie + `__proxy__${proxy}`;
  }
  next();
});

// 验证微信 session
app.use(vertifyWxSession());

// 路由
app.use('/', require('./router/router'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server running @ http://localhost:${port}`);
});

module.exports = app;
