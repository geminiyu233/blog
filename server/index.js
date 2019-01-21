const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')

const app = new Koa()
const bodyparser = require('koa-bodyparser')
const json = require('koa-json') // 美化返回给客户端数据格式
const session = require('koa-generic-session')
const Redis = require('koa-redis')
const mongoose = require('mongoose')
const dbConfig = require('./dbs/config')
const passport = require('./interface/utils/passport')
const admin = require('./interface/admin')

// 这是处理前端跨域的配置
const cors = require('koa2-cors')
app.use(cors({
  origin: function (ctx) {
    if (ctx.url === '/login') {
      return "*"; // 允许来自所有域名请求
    }
    return 'http://localhost:8080';
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

app.proxy = true
app.keys=['ys','keyskeys']
// middlewares
app.use(session({
  key: 'ys',
  prefix: 'ys:uid',
  store: new Redis()
}))

app.use(json())
// 用于接收并解析前台发送过来的post数据
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

// mongoose
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true
})

app.use(passport.initialize())
app.use(passport.session())

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)
  
  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // routes
  app.use(admin.routes(), admin.allowedMethods())

  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()
