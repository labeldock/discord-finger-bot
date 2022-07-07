const path = require('path')
const { handleCreateSession, handleButtonSession } = require('./handleSession')

function startFingerBot({ client, bot }){
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
        
        console.log("parsed.message", parsed.message)

      } else if(parsed.message === "약속"){
        handleCreateSession({ messageEvent, parsed })
        return;
      } else {
        await messageEvent.reply(anyReciveText())
        return;
      }
    }
  });

  client.on('interactionCreate', async (interaction)=>{
    if(isNeverMindInteraction(interaction)) return;

    const parsed = parseIntraction(interaction)
    if(parsed.fingerButton) {
      await handleButtonSession({ interaction, parsed }) ||
      console.log("FingerButton 핸들링 실패")
    }
    /*
    customId
    interaction.user // 인터랙션을 일으킨 사람
    interaction.message // 어떤 메시지에서
    interaction.message.id // 메시지 아이디
    componentType: 'BUTTON'
    */
  });
}

function isNeverMindMessage (messageEvent){
  return (
    messageEvent.content.startsWith('!') || 
    messageEvent.author.bot === true
  ) ? true : false
}

function isNeverMindInteraction (interaction){
  return (
    interaction.isCommand() || false
  ) ? true : false
}

function parseIntraction (interaction){
  return Object.defineProperties({},{
    fingerParameter: {
      enumerable: true,
      configurable: false,
      get (){
        return interaction.customId ? interaction.customId.split('|') : []
      }
    },
    fingerId: {
      enumerable: true,
      configurable: false,
      get (){
        const [prefix, id] = this.fingerParameter
        return prefix === "finger" ? id : null
      }
    },
    fingerAction: {
      enumerable: true,
      configurable: false,
      get (){
        const [prefix,,action] = this.fingerParameter
        return prefix === "finger" ? action : null
      }
    },
    button: {
      enumerable: true,
      configurable: false,
      get (){
        return interaction.componentType === "BUTTON"
      }
    },
    fingerButton: {
      enumerable: true,
      configurable: false,
      get (){
        return  this.button && this.fingerAction
      }
    }
  }) 
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

module.exports = {
  startFingerBot
}