// 引入Koa
const Koa = require('koa')
// 创建一个Koa实例
const app = new Koa()


// 接收get请求的两种方式
app.use(async (ctx) => {
  const { url, request } = ctx
 
  // 1. 从request对象中 接收get请求
  const { query, querystring } = request

  // 2. 直接从上下文中直接接收 get请求
  const { query: ctxQuery, querystring: ctxQuerystring } = ctx

  ctx.body = {
    url, request, query, querystring, ctxQuery, ctxQuerystring
  }
})

app.listen(80)

console.log('服务运行在：http://localhost')