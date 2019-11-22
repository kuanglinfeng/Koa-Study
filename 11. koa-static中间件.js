const Koa = require('koa')
const path = require('path')
const static = require('koa-static')

const app = new Koa()

const staticPath = './static'

// 现在static目录下，有一张`bear.jpg`图片，那么这样配置后，
// 你可以通过`http://localhost/bear.jpg`访问到这张图片了
app.use(static(path.join(__dirname, staticPath)))

app.use(async (ctx) => {
  ctx.body = 'hello flinn'
})

app.listen(80, () => {
  console.log('服务运行在：http://localhost');
})