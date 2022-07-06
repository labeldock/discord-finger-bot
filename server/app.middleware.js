const Router = require('express')
const bodyParser = require('body-parser')

async function createServer (serverState = {}){
  const middlewares = Router()
  const fingeBotMiddleware = require("./middlewares/bot.finger.middleware")
  const jdbMiddleware = require("./middlewares/jdbMiddleware")
  
  middlewares.use(bodyParser.json())
  middlewares.use(await jdbMiddleware(serverState))
  middlewares.use(await fingeBotMiddleware(serverState))

  return { middlewares }
}

module.exports = {
  createServer
}