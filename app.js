const express = require('express');
const apicache = require('apicache');
const path = require('path');
const helmet = require('helmet');
const res = require('./middleware/res');
const bodyParser = require('body-parser');
const authWx = require('./middleware/authWx');
const authWeb = require('./middleware/authWeb');
const session = require('express-session');
const mysql = require('mysql');
const MySQLStore = require('express-mysql-session')(session);


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

// app.use(cache('2 minutes', onlyStatus200));

app.use(express.static(path.resolve(__dirname, 'public')));

// proxy
app.use(function(req, res, next) {
  const proxy = req.query.proxy;
  if (proxy) {
    req.headers.cookie = req.headers.cookie + `__proxy__${proxy}`;
  }
  next();
});

const options = {
  host: '122.152.227.45',
  port: '3306',
  user: 'root',
  password: 'souyin2018@2018',
  database: 'soulyin_test'
};

const sessionStore = new MySQLStore(options);
app.use(
  session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: true
  })
);

// 歌曲相关路由
app.use('/song', require('./controllers/song'));

// 验证微信 session
app.use(authWx());

// 验证网页端 session
app.use(authWeb(sessionStore));

// 用户相关路由
app.use('/sy', require('./controllers/users'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server running @ http://localhost:${port}`);
});

module.exports = app;
