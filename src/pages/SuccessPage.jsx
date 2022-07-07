import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function SuccessPage() {

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
            <h1>✌️</h1>
            <h2>{message ? decodeURIComponent(message) : "성공적으로 처리되었습니다"}</h2>
            <p className="lead">
              이 페이지를 종료하고 계속 진행하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="modal-backdrop fade show"></div>
  </main>)
  
}
