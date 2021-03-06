const Koa = require('koa')
const app = new Koa()

// 对于POST请求的处理，Koa2没有封装方便的获取参数的方法，需要通过解析上下文context中的原生node.js请求对象req来获取。

// 获取post请求的步骤:
// 1. 解析上下文ctx中的原生nodex.js对象req。
// 2. 将POST表单数据解析成query string-字符串.(例如:user=jspang&age=18)
// 3. 将字符串转换成JSON格式。

app.use(async ctx => {
  const html = `
    <h1>Flinn Koa2 POST request</h1>
    <form method='POST' action='/'>
      <span>用户</span>
      <input name='username' />
      <br />
      <span>密码</span>
      <input name='password' type='password'/>
      <br />
      <span>个人网站</span>
      <input name='website' type='text'/>
      <br />
      <button type='submit'>提交</button>
    </form>
  `
  if (ctx.url === '/' && ctx.method === 'GET') {
    // 显示表单页面
    ctx.body = html
  } else if (ctx.url === '/' && ctx.method === 'POST') {
    const postData = await getPostData(ctx)
    ctx.body = postData
  } else {
    ctx.body = '<h1>404-页面找不到</h1>'
  }
})

// 在ctx中获取更详细的post请求的query信息
function getPostData(ctx) {
  return new Promise((resolve, reject) => {
    try {
      let postData = ''
      // 当监听到post请求发来的数据时，执行回调，res为字符
      ctx.req.addListener('data', res => {
        // 这个地方一定是加等于，否则会出错
        postData += res
      })
      ctx.req.on('end', () => {
        resolve(parseQuerystrToJSON(postData))
      })
    } catch (error) {
      reject(error)
    }
  })
}

// 将字符串query转为对象。例如：name=flinn&age:20，可以转为{name: flinn, age: 20}
function parseQuerystrToJSON(str) {
  const arr = str.split('&')
  const o = {}
  arr.forEach(item => {
    const a = item.split('=')
    // decodeURIComponent可以对网址进行转码
    o[a[0]] = decodeURIComponent(a[1])
    // 不转码导致："website": "http%3A%2F%2Fwww.klf.ink"
    // o[a[0]] = a[1]
  })
  return o
}

app.listen(80)

console.log('服务运行在：http://localhost')
