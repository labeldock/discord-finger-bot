const Router = require('express')
const bodyParser = require('body-parser')

async function createServer (serverState = {}){
  const middlewares = Router()
  const fingerApiMiddleware = require("./middlewares/api.finger.middleware")
  const fingerBotMiddleware = require("./middlewares/bot.finger.middleware")

  middlewares.use(bodyParser.json())
  middlewares.use(await fingerApiMiddleware(serverState))
  middlewares.use(await fingerBotMiddleware(serverState))

  return { middlewares }
}

module.exports = {
  createServer
}