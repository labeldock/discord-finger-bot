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
  dbPromiseSession,
  dbUserState,
} = require("./fingerStore")

const moment = require('moment')
require('moment/locale/ko')

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
    description: `외부 브라우져를 띄어 약속을 완성합니다.\n\n`,
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
  dbCandidateSession.insert({
    fingerSessionId,
    messageGuildId:messageEvent.guildId,
    messageChannelId:messageEvent.channelId,
    intentionMessageId:intentionMessageObject.id,
    setupMessageId:setupMessageObject.id,
    starterId:messageEvent.author.id,
    starterName:`${messageEvent.author.username}#${messageEvent.author.discriminator}`,
    starterAvatarUrl:messageEvent.author.avatarURL(),
  })

  messageEvent.delete({ timeout: 20000 });
}

async function handleButtonSession ({ interaction, parsed }){
  const {
    fingerId: fingerSessionId,
    fingerAction,
  } = parsed

  
  switch(fingerAction){
    case STARTER_ACTION.CANCEL:
      const [ data ] = await dbCandidateSession.find({ fingerSessionId })
      
      if(!data){
        return false
      }
      
      interaction.deferUpdate()

      const { 
        intentionMessageId,
        setupMessageId,
      } = data 
      
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
      }).then(async ()=>{
        return true
      })
      break
    case FINGER_ACTION.ACCEPT:
    case FINGER_ACTION.MAYBE:
    case FINGER_ACTION.DONT:
      interaction.deferUpdate()
      insertUserState({ fingerSessionId, user:interaction.user, promiseState:fingerAction })
      await updatePromiseMessage({ 
        intentionMessage:interaction.message, 
        fingerSessionId 
      })
      
      return true
      break
    case FINGER_ACTION.CANCEL:
      interaction.deferUpdate()
      await dbUserState.remove({ fingerSessionId, userId:interaction.user.id })
      await updatePromiseMessage({ 
        intentionMessage:interaction.message, 
        fingerSessionId 
      })
      
      return true
      break
    default:
      break
  }
}

async function handleCreatePromiseSession ({ client, candiateSession, promisePayload }){

  const { 
    fingerSessionId,
    messageGuildId,
    messageChannelId,
    setupMessageId,
    intentionMessageId,
    starterId,
    starterName,
    starterAvatarUrl,
  } = candiateSession

  const targetGuild = client.guilds.cache.get(messageGuildId);
  const targetChannel = targetGuild.channels.cache.get(messageChannelId)
  const setupMessage = await targetChannel.messages.fetch(setupMessageId)
  const intentionMessage = await targetChannel.messages.fetch(intentionMessageId)
  
  //await setupMessage.delete({ timeout: 20000 });
  
  await dbPromiseSession.insert({
    fingerSessionId,
    messageGuildId,
    messageChannelId,
    intentionMessageId,
    promisePayload,
    starterId,
  })

  await setupMessage.delete({ timeout: 20000 });

  const user = await targetGuild.members.fetch(starterId)
  insertUserState({ fingerSessionId, user })
  updatePromiseMessage({ intentionMessage, fingerSessionId })
}

async function updatePromiseMessage ({ intentionMessage, fingerSessionId }){
  const [ promiseSession ] = await dbPromiseSession.find({ fingerSessionId })

  if(!promiseSession){
    throw new Error("Promise session not found")
  }

  const { starterId, promisePayload:{ title, description, startDate, startTime } } = promiseSession
  const promiseUsers = await dbUserState.find({ fingerSessionId })
  const acceptUsers = promiseUsers.filter(({ promiseState })=>promiseState===FINGER_ACTION.ACCEPT)
  const maybeUsers = promiseUsers.filter(({ promiseState })=>promiseState===FINGER_ACTION.MAYBE)
  const dontUsers = promiseUsers.filter(({ promiseState })=>promiseState===FINGER_ACTION.DONT)
  
  let descriptionBuilding = ''

  descriptionBuilding += `방장 : <@${starterId}>`
  descriptionBuilding += ` / 상태 : ${moment(`${startDate} ${startTime}`,'YYYY-MM-DD HH:mm').fromNow()} 시작`
  
  if(description) { descriptionBuilding += `\n\n${description}\n\n` }
  
  
  if(acceptUsers.length){ descriptionBuilding += `\n\n${FINGER_ACTION_EMOJI.ACCEPT}참여해요!(${acceptUsers.length}명)\n${acceptUsers.map(({ userId })=>`<@${userId}>`).join(', ')}` }
  if(maybeUsers.length ){ descriptionBuilding += `\n\n${FINGER_ACTION_EMOJI.MAYBE }아마도요(${maybeUsers.length}명)\n${maybeUsers.map(({ userId })=>`<@${userId}>`).join(', ')}` }
  if(dontUsers.length  ){ descriptionBuilding += `\n\n${FINGER_ACTION_EMOJI.DONT  }불참해요ㅠ(${dontUsers.length}명)\n${dontUsers.map(({ userId })=>`<@${userId}>`).join(', ')}` }

  const embed1 = { 
    color: 'BLUE',
    title,
    fields: [
      { name:"응답", value:`${promiseUsers.length}명`, inline:true },
      { name:"날짜", value:startDate, inline:true },
      { name:"시간", value:startTime, inline:true },
    ],
    description:descriptionBuilding,
  }


  

  const buttonsComponent = reduceMessageActionRow(createUserIntentionButtons({ fingerSessionId, disabled:false }))
  
  await intentionMessage.edit({ embeds:[embed1] })
  await intentionMessage.edit({ components:[buttonsComponent] })
}


async function insertUserState ({ fingerSessionId, user, promiseState = FINGER_ACTION.ACCEPT }){
  await dbUserState.remove({ fingerSessionId, userId:user.id })
  await dbUserState.insert({ 
    fingerSessionId, 
    userId:user.id,
    username:user.username,
    discriminator:user.discriminator,
    avatarUrl:user.avatarURL(),
    promiseState,
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
    new MessageButton()
    .setCustomId(`finger|${fingerSessionId}|${FINGER_ACTION.CANCEL}`)
    .setLabel(`${FINGER_ACTION_EMOJI.CANCEL}`)
    .setStyle("SECONDARY")
    .setDisabled(disabled),
  ]
}

function createStarterSetupButtons ({ 
  fingerSessionId, 
  disabled = false 
}){
  return [
    new MessageButton({
      label: "작성하기",
      style: "LINK",
      url: `${candidateUrl}/${fingerSessionId}`,
      disabled
    }),
    new MessageButton()
    .setCustomId(`finger|${fingerSessionId}|${STARTER_ACTION.CANCEL}`)
    .setLabel(`❌취소`)
    .setStyle("PRIMARY")
    .setDisabled(disabled),
  ]
}

module.exports = {
  handleCreateSession,
  handleButtonSession,
  handleCreatePromiseSession
}
