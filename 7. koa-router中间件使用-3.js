const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()

// 子路由
const home = new Router()
home
  .get('/flinn', (ctx) => {
    ctx.body = 'home下的flinn page'
  })
  .get('/todo', (ctx) => {
    ctx.body = 'home下的todo page'
  })

// 子路由
const detail = new Router()
detail
  .get('/flinn', ctx => {
    ctx.body = 'detail下的flinn page'
  })
  .get('/todo', ctx => {
    ctx.body = 'detail下的todo page'
  })

// 父级路由
const router = new Router()

// 添加子路由/home 当访问/home的时候就会去子路由/home下面匹配路径
router.use('/home', home.routes(), home.allowedMethods())

// 添加子路由/detail 当访问/detail的时候就会去子路由/detail下面匹配路径
router.use('/detail', detail.routes(), detail.allowedMethods())


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
