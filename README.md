## 搭建环境

1. `npm init -y`
2. `npm install --save koa`

## 我的第一个koa程序

```js
// 引入Koa
const Koa = require('koa')
// 创建一个Koa的实例
const app = new Koa()

// 使用异步中间件
app.use(async (ctx) => {
  // 响应体：'hello world'
  ctx.body = 'hello world'
})

// 监听80端口
app.listen(80)

console.log('服务运行在:http://localhost')
```

## GET请求的接收

> 应用场景：在前后端配合时，后端都会告知你的请求时GET/POST请求，我们对两种请求在前端也是非常熟悉的，比如做电商系统时，我们要得到一个商品的详细信息，需要传递GET形式的商品编号到后台，后台返回给我们数据。

1. 在koa2中GET请求的参数有两种形式：query和querystring。
2. query和querystring区别
  1. query：返回的是格式化好的参数对象。
  2. querystring：返回的是请求字符串。

### 获取GET请求的两种方式

1. ctx的request对象
2. 直接从ctx中获取Get请求

```js
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
```

## POST请求的接收

一个坑：对于POST请求的处理，Koa2没有封装方便的获取参数的方法，因此需要通过解析上下文context中的原生node.js请求对象req来获取。

### 获取POST请求的步骤

1. 解析上下文ctx中的原生nodex.js对象req。
2. 将POST表单数据解析成query string-字符串.(例如:user=jspang&age=18)
3. 将字符串转换成JSON格式。

### `ctx.request`和`ctx.req`的区别

1. ctx.request: 是Koa2中context经过封装的请求对象，它用起来更直观和简单。
2. ctx.req: 是context提供的node.js原生HTTP请求对象。这个虽然不那么直观，但是可以得到更多的内容，适合我们深度编程。

### 使用`ctx.method`判断请求类型

Koa2中提供了ctx.method属性，可以轻松的得到请求的类型，然后根据请求类型编写不同的相应方法。

写个demo

```js
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
```



