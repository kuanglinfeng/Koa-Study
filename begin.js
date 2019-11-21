const Koa = require('koa')
const app = new Koa()

app.use(async (ctx) => {
  ctx.body = 'hello world'
})

app.listen(80)

console.log('服务运行在:http://localhost')