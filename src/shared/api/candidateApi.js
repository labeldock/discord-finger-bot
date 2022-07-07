import { fetch } from '~/shared/fetch'

export async function fetchDiscordTime (){
  return await fetch.get(`/api/discord/time`)
}

export async function fetchCandidateData ({ fingerSessionId }){
  return await fetch.get(`/api/candidate/${fingerSessionId}`)
}

export async function postPromise ({ 
  fingerSessionId,
  data,
}){
  const { 
    title,
    description,
    startDate,
    startTime,
  } = data
  return await fetch.post(`/api/candidate/${fingerSessionId}/promise`, {
    title,
    description,
    startDate,
    startTime,
  })
}