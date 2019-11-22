// 引入Koa
const Koa = require('koa')
// 创建一个Koa实例
const app = new Koa()

app.use(async ctx => {
  if (ctx.url === '/index') {
    // 写入cookie
    ctx.cookies.set('name', 'flinn', {
      // 域名
      domain: 'localhost',
      // 路径
      path: '/index',
      // cookie有效时间
      maxAge: 1000 * 60 * 60 * 24,
      // 失效日期
      expires: new Date('2019-12-12'),
      // 是有只有http协议才有效
      httpOnly: false,
      // 是否允许重写
      overwrite: false
    })
    ctx.body = 'cookie is ok'
  } else {
    // 读出cookie
    if (ctx.cookies.get('name')) {
      ctx.body = ctx.cookies.get('name')
    } else {
      ctx.body = 'no cookie'
    }
  }
})

app.listen(80)

console.log('服务运行在：http://localhost')
