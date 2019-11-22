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

一个坑：对于POST请求的处理，Koa2没有封装方便的获取参数的方法。所以我们可以：

1. 自己手写一个接受处理函数，这就需要通过解析上下文context中的原生node.js请求对象req来获取。
   
2. 使用别人造好的轮子，如`koa-bodyparser`

### 使用`ctx.method`判断请求类型

Koa2中提供了ctx.method属性，可以轻松的得到请求的类型，然后根据请求类型编写不同的相应方法。

使用`ctx.method`写个demo

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

### 获取POST请求的步骤

1. 解析上下文ctx中的原生nodex.js对象req。
2. 将POST表单数据解析成query string-字符串.(例如:user=jspang&age=18)
3. 将字符串转换成JSON格式。

### `ctx.request`和`ctx.req`的区别

1. ctx.request: 是Koa2中context经过封装的请求对象，它用起来更直观和简单。
2. ctx.req: 是context提供的node.js原生HTTP请求对象。这个虽然不那么直观，但是可以得到更多的内容，适合我们深度编程。

有了上面的了解，我们可以继续完善上面demo部分的post请求部分

我们希望，当表单数据提交后，触发的post请求被服务端监听到，然后服务端返回我们输入的信息对象

例如返回下面这样：

```js
{
"username": "flinn",
"password": "123",
"website": "http://www.klf.ink"
}
```

封装步骤：

1. `getPostData()`的功能

这个函数返回一个Promise对象，它可以获取到post到服务端的信息，然后我们直接将这个信息在body输出显示

```js
 } else if (ctx.url === '/' && ctx.method === 'POST') {
    const postData = await getPostData(ctx)
    ctx.body = postData
  } else {
    ctx.body = '<h1>404-页面找不到</h1>'
  }
```

2. 封装`getPostData()`

```js
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
```

3. 实现`parseQuerystrToJSON()`工具函数

```js
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
```

### 使用`koa-bodyparser`来实现post请求的接收处理函数

> 它主要就是将post请求直接转换到`ctx.request.body`里

1. 安装`npm install --save koa-bodyparser`

2. 导入`const bodyParser = require('koa-bodyparser')`

3. 使用中间件`app.use(bodyParser())`

4. 使用功能

```js
else if (ctx.url === '/' && ctx.method === 'POST') {
  // 这里直接用即可
  const postData = ctx.request.body
  ctx.body = postData
} else {
  ctx.body = '<h1>404-页面找不到</h1>'
}
```

## koa原生路由实现

ctx.request.url：可以获取到地址栏的路径（不包含协议，域名和端口）

```js
app.use(async (ctx) => {
  // 获取url的路径
  let url = ctx.request.url
  // 访问localhost/klf   显示 /klf
  ctx.body = url
})
```

实现步骤:

1. 总体流程
```js
app.use(async (ctx) => {
  // 获取url的路径
  let url = ctx.request.url
  // 根据路由地址url 返回一个html
  let html = await route(url)
  // 访问localhost 显示 /
  ctx.body = html
})
```

2. 实现`route`函数

```js
async function route(url) {
  let page = '404.html'
  switch (url) {
    case '/': {
      page = 'index.html'
      break
    }
    case '/index': {
      page = 'index.html'
      break
    }
    case '/todo': {
      page = 'todo.html'
      break
    }
    case '/404': {
      page = '404.html'
      break
    }
    default:
      break;
  }
  let html = await render(page)
  return html
}
```

3. 实现`render`函数
```js
const fs = require('fs')

function render(page) {
  return new Promise((resolve, reject) => {
    let pageUrl = `./pages/${page}`
    fs.readFile(pageUrl, 'binary', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
```

