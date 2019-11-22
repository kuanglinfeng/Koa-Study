// 引入Koa
const Koa = require('koa')
// 创建一个Koa的实例
const app = new Koa()

// 使用异步中间件
app.use(async (ctx) => {
  // 响应体：'hello world'
  ctx.body = 'hello world'
})

// 监听80端口
app.listen(80)

console.log('服务运行在:http://localhost')