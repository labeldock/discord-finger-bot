import { fetch } from '~/shared/fetch'

export async function fetchDiscordTime (){
  return await fetch.get(`/api/discord/time`)
}

export async function fetchCandidateData ({ fingerSessionId }){
  return await fetch.get(`/api/candidate/${fingerSessionId}`)
}