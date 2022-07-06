import { useEffect } from 'react'
import { fetchCandidateData } from '~/shared/api/candidateApi.js'
import { useParams, useNavigate } from 'react-router-dom'

export default function CandidatePage() {

  const { message } = useParams()
  
  useEffect(()=>{
    //fetchCandidateData().then(()=>{})
  }, [])
  
  return (<main className="container">
    <div className="py-5 text-center">
      <h2>{message ? decodeURIComponent(message) : "에러"}</h2>
      <p className="lead">
        더 진행 할 수 없습니다
      </p>
    </div>
  </main>)
  
}
