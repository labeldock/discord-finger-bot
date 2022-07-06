

function useMessageInteraction({ client, bot }){

  const {
    usedMeta,
    parseCommandMessage
  } = useCommandMessageHelper(bot)
  
  //mentionHelper(event)
  /*
    channelId: '',
    guildId: '',
    createdTimestamp: 1657025883339,
    type: 'DEFAULT',
    system: false,
    content: 'ㅇ허',
    pinned: false,
    author: User {
      id: string,
      bot: boolean,
      system: boolean,
      flags: UserFlags { bitfield: 0 },
      username: string,
      discriminator: string(likenumber),
      avatar: string(likeuid),
      banner: undefined,
      accentColor: undefined
    },
    ...
  */
  client.on('messageCreate', async messageEvent => {
    if(isNeverMindMessage(messageEvent)) return;
    const parsed = parseCommandMessage(messageEvent)
    if(parsed.mentioned){
      // 아무것도 입력하지 않는경우
      if(parsed.message.length === 0 || /^(\?|help)$/.test(parsed.message)){
        const helpMessage = await messageEvent.channel.send({ embeds:[
          defineEmbed({ 
            color: 'WHITE',
            title: '저를 불러주셨군요.\n키보드로 명령을 입력하세요.',
            description: `약속잡기\n\`\`\`\n@${usedMeta.botName} 약속\n\`\`\`\n\n이 메시지는 자동 삭제됩니다`,
          })
        ]})
        
        messageEvent.delete({ timeout: 20000 });
        setTimeout(()=>{
          helpMessage.delete({ timeout: 20000 });
        },10000)

      } else if(parsed.message === "약속"){
        handleCreateSession({ messageEvent })
        return;
      } else {
        await messageEvent.reply(anyReciveText())
        return;
      }
    }
  });
}

function isNeverMindMessage (messageEvent){
  return (
    messageEvent.content.startsWith('!') || 
    messageEvent.author.bot === true
  ) ? true : false
}

function useCommandMessageHelper (bot){
  const botId = bot.id
  const botName = bot.username
  const botDisc = bot.discriminator
  const tagText = `${botName}#${botDisc}`
  const menText = `<@${botId}>`

  return {
    usedMeta:{
      botId,
      botName,
      botDisc,
      tagText,
      menText,
    },
    parseCommandMessage (messageEvent){
      const { content } = messageEvent
    
      const helperValues = Object.defineProperties({
        tagText
      }, {
        mentioned: {
          enumerable: true,
          configurable: false,
          get (){
            return content.startsWith(menText)
          }
        },
        content: {
          enumerable: true,
          configurable: false,
          get (){
            return content
          }
        },
        message: { 
          enumerable: true,
          configurable: false,
          get (){
            if(!this.mentioned){
              return this.content
            }
            const rightContent = content.substr(menText.length)
            return rightContent.replace(/^\s*/,"").trim()
          }
        },
      })
  
      return helperValues
    }
  }
}

function defineEmbed (payload = {}){
  return payload;
}

const { 
  MessageActionRow, 
  MessageButton,
} = require("discord.js");

const { generateUUID } = require("../../utils/nodeFunction");
 
const FINGER_ACTION = {
  ACCEPT: "FIN_ACCEPT",
  MAYBE: "FIN_MAYBE",
  DONT: "FIN_DONT",
}

const STARTER_ACTION = {
  CANCEL: "STA_CANCEL",
  DEPLOY: "STA_DEPLOY",
}

const FINGER_ACTION_EMOJI = {
  ACCEPT: "🤗",
  MAYBE: "😅",
  DONT: "😢",
}

function anyReciveText (){
  const anytext = [
    '네?',
    '저번에도 들어봤어요. 언제였더라...', 
    '아, 네... 알겠어요.',
    '이런식으로 말을 걸어주는게 나쁘지 않네요.', 
    '아, 네 그런말을 들으니 반갑네요',
    '무슨 의미인거죠?',
    '계속 얘기해 보시겠어요?',
    '대화를 나눌 때는 아니지만... 감사합니다!',
  ]
  return anytext[Math.floor(Math.random() * anytext.length)]
}

async function handleCreateSession ({ messageEvent }){

  const fingerSessionId = generateUUID()
  const startUser = messageEvent.author
  
  const promiseEmbed = defineEmbed({ 
    color: 'RED',
    title: '새로운 약속 만들기',
    description: `${startUser.username}님이 새로운 약속을 만드는 중이에요\n💖두근두근💖`,
  })

  const starterEmbed = defineEmbed({ 
    color: 'YELLOW',
    title: '핑거봇이 약속 만들기를 도와드립니다',
    description: '제 말에 대답하시면 약속이 만들어집니다',
  })
 
  const intentionMessageObject = await messageEvent.channel.send({
    embeds: [promiseEmbed],
    components: [reduceMessageActionRow(createUserIntentionButtons({ fingerSessionId, disabled:true }))],
  })

  const setupMessageObject = await messageEvent.reply({
    embeds: [starterEmbed],
    components: [reduceMessageActionRow(createStarterSetupButtons({ fingerSessionId, disabled:false }))],
    ephemeral: true,
  })
  
  const collector = messageEvent.channel.createMessageComponentCollector({
    filter (interaction){
      return interaction.customId.startsWith(fingerSessionId)
    },
  })

  collector.on("collect", async (interaction)=>{
    const action = interaction.customId.substr(fingerSessionId.length + 1)
    switch (action){
      case FINGER_ACTION.ACCEPT:
        break
      case FINGER_ACTION.MAYBE:
        break
      case FINGER_ACTION.DONT:
        break
      case STARTER_ACTION.CANCEL:
        setupMessageObject.delete({ timeout: 20000 });
        intentionMessageObject.delete({ timeout: 20000 });
        messageEvent.delete({ timeout: 20000 });
        break
      case STARTER_ACTION.DEPLOY:
        break
      default:
        console.log(`지원하지 않는 on::collect::FINGER_ACTION[${action}]${STARTER_ACTION.CANCEL}`)
        break
    }
  })
}

function reduceMessageActionRow (components){
  return new MessageActionRow().addComponents(...components)
}

function createUserIntentionButtons ({ 
  fingerSessionId, 
  disabled = false 
}){
  return [
    new MessageButton()
    .setCustomId(`${fingerSessionId}:${FINGER_ACTION.ACCEPT}`)
    .setLabel(`${FINGER_ACTION_EMOJI.ACCEPT}참여`)
    .setStyle("PRIMARY")
    .setDisabled(disabled),
    new MessageButton()
    .setCustomId(`${fingerSessionId}:${FINGER_ACTION.MAYBE}`)
    .setLabel(`${FINGER_ACTION_EMOJI.MAYBE}아마`)
    .setStyle("SUCCESS")
    .setDisabled(disabled),
    new MessageButton()
    .setCustomId(`${fingerSessionId}:${FINGER_ACTION.DONT}`)
    .setLabel(`${FINGER_ACTION_EMOJI.DONT}불참`)
    .setStyle("DANGER")
    .setDisabled(disabled),
  ]
}

function createStarterSetupButtons ({ 
  fingerSessionId, 
  disabled = false 
}){
  return [
    new MessageButton()
    .setCustomId(`${fingerSessionId}:${STARTER_ACTION.CANCEL}`)
    .setLabel(`❌생성취소`)
    .setStyle("PRIMARY")
    .setDisabled(disabled),
    new MessageButton()
    .setCustomId(`${fingerSessionId}:${FINGER_ACTION.DEPLOY}`)
    .setLabel(`📢공지합니다`)
    .setStyle("SUCCESS")
    .setDisabled(disabled),
  ]
}


module.exports = {
  useMessageInteraction
}