const { 
  MessageActionRow, 
  MessageButton,
} = require("discord.js");
const { defineEmbed } = require("./fingerModel")
const { 
  STARTER_ACTION,
  FINGER_ACTION,
  FINGER_ACTION_EMOJI,
} = require("./fingerConstant")
const { 
  dbCandidateSession,
  dbReservedSession,
  dbUserState,
} = require("./fingerStore")

const webUrl = `${process.env.VITE_WEB_HOST}:${process.env.VITE_WEB_PORT}`
const candidateUrl = `${webUrl}/candidate`


const { generateUUID } = require("../../utils/nodeFunction");

async function handleCreateSession ({ messageEvent }){
  const fingerSessionId = generateUUID()
  const startUser = messageEvent.author
  
  const promiseEmbed = defineEmbed({ 
    color: 'RED',
    title: '새로운 약속 만드는 중',
    description: `${startUser.username}님이 새로운 약속을 만드는 중이에요\n💖두근두근💖`,
  })

  const starterEmbed = defineEmbed({ 
    color: 'YELLOW',
    title: '핑거봇이 약속 만들기를 도와드립니다',
    description: `외부 브라우져를 띄어 약속을 완성합니다.\n[여기를 클릭 하세요!](${candidateUrl}/${fingerSessionId})`,
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


  // 새 예약을 nedb에 기록
  console.log("messageEvent", messageEvent)
  messageEvent.author.username
  dbCandidateSession.insert({
    fingerSessionId,
    messageChannelId:messageEvent.channelId,
    intentionMessageId:intentionMessageObject.id,
    setupMessageId:setupMessageObject.id,
    starterName:messageEvent.author.username,
  })

  messageEvent.delete({ timeout: 20000 });
}

async function handleButtonSession ({ interaction, parsed }){
  const {
    fingerId: fingerSessionId,
    fingerAction,
  } = parsed

  const [ data ] = await dbCandidateSession.find({ fingerSessionId })
  if(!data){
    return false
  }

  const { 
    intentionMessageId,
    setupMessageId,
  } = data 

  switch(fingerAction){
    case STARTER_ACTION.CANCEL:
      return Promise.all([
        interaction.channel.messages.fetch(intentionMessageId),
        interaction.channel.messages.fetch(setupMessageId)
      ]).then(async ([
        intentionMessageObject,
        setupMessageObject,
      ])=>{
        await setupMessageObject.delete({ timeout: 20000 });
        await intentionMessageObject.delete({ timeout: 20000 });
      }).then(async ()=>{
        await dbCandidateSession.remove({ fingerSessionId })
      })
      break
    default:
      break
  }
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
    .setCustomId(`finger|${fingerSessionId}|${FINGER_ACTION.ACCEPT}`)
    .setLabel(`${FINGER_ACTION_EMOJI.ACCEPT}참여`)
    .setStyle("PRIMARY")
    .setDisabled(disabled),
    new MessageButton()
    .setCustomId(`finger|${fingerSessionId}|${FINGER_ACTION.MAYBE}`)
    .setLabel(`${FINGER_ACTION_EMOJI.MAYBE}아마`)
    .setStyle("SUCCESS")
    .setDisabled(disabled),
    new MessageButton()
    .setCustomId(`finger|${fingerSessionId}|${FINGER_ACTION.DONT}`)
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
    .setCustomId(`finger|${fingerSessionId}|${STARTER_ACTION.CANCEL}`)
    .setLabel(`❌생성취소`)
    .setStyle("PRIMARY")
    .setDisabled(disabled),
  ]
}

module.exports = {
  handleCreateSession,
  handleButtonSession
}
