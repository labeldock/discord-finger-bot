const Router = require("express")
const { buildBotToken } = require('../../env/config.json')
const { Client, Intents } = require('discord.js');
const { startFingerBot } = require('./fingerLibs/main')
const moment = require('moment')
module.exports = async serverState => {
  const router = Router();

  const client = new Client({ intents: 
    [
      Intents.FLAGS.GUILDS, 
      Intents.FLAGS.GUILD_INTEGRATIONS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
    ]
  });

  client.on('ready', () => {
    serverState.discordTime = moment(client.readyAt).valueOf()
    serverState.discordTimeOffest = Date.now() - serverState.discordTime 
    serverState.discordClient = client
    /*
    ClientUser {
      id: string,
      bot: true,
      system: false,
      flags: UserFlags { bitfield: 0 },
      username: 'finger-bot',
      discriminator: string[4],
      avatar: string(Avatar),
      banner: undefined,
      accentColor: undefined,
      verified: true,
      mfaEnabled: false
    }
    */
    const { user:bot } = client
    console.log(`봇이 준비됐습니다 ${bot.tag}`)

    try {
      startFingerBot({ client, bot, store:serverState.store })
    } catch(error) {
      console.log(error)
      console.log(`${bot.tag} 장비를 정지합니까 ?`)
    }

    process.on("SIGINT", () => {
      try {
        client.destroy()
        console.log(`${bot.tag} 장비를 정지합니다`);
      } catch (error) {
        console.log(error)
      }
      process.exit()
    })

  });

  client.login(buildBotToken);

  return router;
}