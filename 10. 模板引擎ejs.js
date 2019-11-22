const Koa = require('koa')
const views = require('koa-views')
const path = require('path')

const app = new Koa()

// 使用中间件views, 并且在views中 指定模板渲染路径，以及模板渲染引擎
app.use(views(path.join(__dirname, './view'), {
  extension: 'ejs'
}))

// 在模板页里就可以拿到变量title并且渲染出hello flinn了
app.use(async (ctx) => {
  let title = 'hello flinn'
  await ctx.render('index', {title})
})

app.listen(80, () => {
  console.log('服务运行在：http://localhost');
})