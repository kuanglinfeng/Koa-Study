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

## `koa-router`中间件

1. 安装`npm install --save koa-router`
2. 导入`const Router = require('koa-router')`
3. 创建实例`const router = new Router()`
4. 启用路由&设置响应头
   ```js
   app
   // 启用路由
    .use(router.routes())
    // 这是官方文档的推荐用法, 我们可以看到router.allowedMethods()
    // 用在了路由匹配router.routes()之后, 所以在当所有路由中间件最后调用.
    // 此时根据ctx.status设置response响应头
    .use(router.allowedMethods())
   ```
5. 使用
   ```js
    router
      .get('/', (ctx, next) => {
        ctx.body = 'hello flinn'
      })
      .get('/todo', (ctx, next) => {
        ctx.body = 'todo page'
      })
   ```
### 为所有的路由添加一个父层级

项目中，如果我们已经写好了几十个甚至上百页面的路由，但是突然需求更改，
需要在这些页面的路由上再添加一个层级，比如本来有`/a`,`/a/b`等路由，
现在需要都添加一个层级`/begin`,那么原本的路由就变成`/begin/a`，`/begin/a/b`等路由了，
这个时候，我们可以使用`prefix`来解决这个问题。

代码演示
```js
// 现在访问首页以及其它页面，就需要在路径前面加上`/begin`
const router = new Router({
  prefix: '/begin'
})
```

### 添加子路由

```js
const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()

// 子路由/home
const home = new Router()
home
  .get('/flinn', (ctx) => {
    ctx.body = 'home下的flinn page'
  })
  .get('/todo', (ctx) => {
    ctx.body = 'home下的todo page'
  })

// 子路由/detail
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
```

### 路由查询参数接收

1. get请求参数接收
```js
router.get('/', (ctx, next) => {
  // 将query对象直接返回到页面
  ctx.body = ctx.query
})
```

2. post请求参数接收可以参考`3.使用koa-bodyparser完成post请求的接收.js`


## cookie操作

```js
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
```

## 模板引擎`ejs`

在koa中使用模板机制必须依靠中间件，最常用的就是`koa-views`，下面以常用的模板引擎`ejs`为例

1. 安装中间件`koa-views`
   `npm install --save koa-views`
2. 安装模板引擎`ejs`
   `npm install --save ejs`

`/view/index.ejs`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title><%= title %></title>
</head>
<body>
  <h1><%= title %></h1>
  <p>EJS welcome to <%= title %></p>
</body>
</html>
```

`/10. 模板引擎ejs.js`

```js
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
```

## 使用`koa-static`读取静态资源

默认情况下，比如我们在`static`目录下，有一种bear.jpg
现在开启服务后，我在`http://localhost/static/bear.jpg`想访问
这张图片，但是结果是读取失败，为了解决这个问题，可以使用`koa-static`

1. 安装`npm install --save koa-static`
2. 使用
   ```js
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
   ```
