const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()

// 现在访问首页以及其它页面，就需要在路径前面加上`/begin`
const router = new Router({
  prefix: '/begin'
})

router
  .get('/', (ctx, next) => {
    ctx.body = 'hello flinn'
  })
  .get('/todo', (ctx, next) => {
    ctx.body = 'todo page'
  })

app
  // 启用路由
  .use(router.routes())
  // 这是官方文档的推荐用法, 我们可以看到router.allowedMethods()
  // 用在了路由匹配router.routes()之后, 所以在当所有路由中间件最后调用.
  // 此时根据ctx.status设置response响应头
  .use(router.allowedMethods())

app.listen(80, () => {
  console.log('服务运行在：http://localhost')
})
