const Koa = require('koa')
const app = new Koa()

// 对于POST请求的处理，Koa2没有封装方便的获取参数的方法，需要通过解析上下文context中的原生node.js请求对象req来获取。

// 获取post请求的步骤:
// 1. 解析上下文ctx中的原生nodex.js对象req。
// 2. 将POST表单数据解析成query string-字符串.(例如:user=jspang&age=18)
// 3. 将字符串转换成JSON格式。

app.use(async (ctx) => {
  const html = `
    <h1>Flinn Koa2 POST request</h1>
    <form method='POST' action='/'>
      <span>用户</span>
      <input name='username' />
      <br />
      <span>密码</span>
      <input pwd='username' type='password'/>
      <br />
      <button type='submit'>提交</button>
    </form>
  `
  if (ctx.url === '/' && ctx.method === 'GET') {
    // 显示表单页面
    ctx.body = html
  } else if (ctx.url === '/' && ctx.method === 'POST') {
    ctx.body = '接收到POST参数'
  } else {
    ctx.body = '<h1>404-页面找不到</h1>'
  }
})


app.listen(80)

console.log('服务运行在：http://localhost')