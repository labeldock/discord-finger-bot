const fs = require('fs')
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')
const VITE_SERVER_PORT = Number(process.env.VITE_SERVER_PORT)

async function createServer() {
  const app = express()
  const { createServer: createBotServer } = require('./server/app.middleware')

  const bot = await createBotServer()
  app.use(bot.middlewares)

  // 미들웨어 모드로 Vite 서버를 생성하고 애플리케이션의 타입을 'custom'으로 설정합니다.
  // 이는 Vite의 자체 HTML 제공 로직을 비활성화하고, 상위 서버에서 이를 제어할 수 있도록 합니다.
  const vite = await createViteServer({
    server: { middlewareMode: 'spa' },
    appType: 'custom'
  })
  
  // Vite를 미들웨어로 사용합니다.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // index.html 파일을 제공합니다 - 아래에서 이를 다룰 예정입니다.
  })

  app.listen(VITE_SERVER_PORT)
}

createServer()