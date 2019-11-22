const Koa = require('koa')
const app = new Koa()
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
      break
  }
  let html = await render(page)
  return html
}

app.use(async ctx => {
  // 获取url的路径
  let url = ctx.request.url
  // 根据路由地址url 返回一个html
  let html = await route(url)
  // 访问localhost 显示 /
  ctx.body = html
})

app.listen(80)

console.log('服务运行在：http://localhost')
