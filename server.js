const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')
const { createServer: createBotServer } = require('./server/app.middleware')
const { hostname } = require('./env/config.json')

const VITE_WEB_PORT = Number(process.env.VITE_WEB_PORT)
const VITE_HOT_PORT = Number(process.env.VITE_HOT_PORT)

function resolve (p){
  return path.resolve(__dirname, p)
}

async function createServer() {
  const app = express()

  const bot = await createBotServer()
  app.use(bot.middlewares)

  // 미들웨어 모드로 Vite 서버를 생성하고 애플리케이션의 타입을 'custom'으로 설정합니다.
  // 이는 Vite의 자체 HTML 제공 로직을 비활성화하고, 상위 서버에서 이를 제어할 수 있도록 합니다.
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      watch: {
        // During tests we edit the files too fast and sometimes chokidar
        // misses change events, so enforce polling for consistency
        usePolling: true,
        interval: 100
      },
      hmr: /stage|production/.test(process.env.SERVE_ENV) ? false : {
        port: VITE_HOT_PORT
      }
    },
    appType: 'custom'
  })
  
  // Vite를 미들웨어로 사용합니다.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    try {
      let html = fs.readFileSync(resolve('./index.html'),'utf-8');
      html = await vite.transformIndexHtml(req.url, html)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch(e) {
      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  app.listen(VITE_WEB_PORT, ()=>{
    console.log(`VITE ${hostname}:${VITE_WEB_PORT}`)
  })
}

createServer()