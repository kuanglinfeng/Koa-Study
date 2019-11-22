const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

router.get('/', (ctx, next) => {
  // 将query对象直接返回到页面
  ctx.body = ctx.query
})

app.use(router.routes(), router.allowedMethods())

app.listen(80, () => {
  console.log('服务运行在：http://localhost')
})