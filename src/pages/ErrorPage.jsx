import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function ErrorPage() {

  const { message } = useParams()
  
  useEffect(()=>{
    //fetchCandidateData().then(()=>{})
  }, [])
  
  return (<main className="container">
    <div className="modal fade show" role="dialog" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body text-center">
            <br/>
            <h1>😱</h1>
            <h2>{message ? decodeURIComponent(message) : "에러"}</h2>
            <p className="lead">
              더 진행 할 수 없습니다
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="modal-backdrop fade show"></div>
  </main>)
  
}
