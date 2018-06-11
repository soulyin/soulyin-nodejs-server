# souyin-nodejs-server

使用 express 框架，借鉴 egg.js 的部分思想及目录结构构建了 “soul音” 的 NodeJS 的服务端。

## 目录结构

- config：配置文件
- controller：controller，用于验证前端的数据输入，以及输入数据到前端；一般在 controller 中调用 server 来进行更加复杂的数据操作（如：查询数据库，请求第三方服务，拼接前端所需要的数据等）
- middleware：中间件
- router：路由
- server：被 controller 调用，用于进行复杂的后端数据操作（如：查询数据库，请求第三方服务，拼接前端所需要的数据等）
- util：工具
- validator：前端数据验证
- app.js：服务启动文件
- db.js：数据库操作的封装