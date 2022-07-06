import { useState, useEffect } from 'react'
import { fetchCandidateData } from '~/shared/api/candidateApi'
import { useParams, useNavigate } from 'react-router-dom'
export default function CandidatePage() {

  const { fingerSessionId } = useParams()
  const navigate = useNavigate()
  const [ candidateState, setCandidateState ] = useState(null)
  useEffect(()=>{
    if(!fingerSessionId){
      navigate(`/error/${encodeURIComponent("id가 누락")}`)
      return
    }

    fetchCandidateData({ fingerSessionId }).then((candidateData)=>{
      setCandidateState(candidateData)
    })

    return ()=>{
      setCandidateState(null)
    }
  }, [])

  console.log('candidateState', candidateState)
  
  return (<main className="container">
    {
      <div>{JSON.stringify(candidateState)}</div>
    }
    {
      !candidateState ? (
        <h2>잠시만 기다려주세요</h2>
      ) : (
        <>
          <h2>{candidateState.starterName}님의 약속잡기</h2>
          <p className="lead">
            시작날짜 : {}
            아래의 폼을 완성하세요
          </p>
        </>
      )
    }
  </main>)
  
}
