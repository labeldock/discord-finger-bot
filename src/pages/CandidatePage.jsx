import { useState, useMemo, useEffect } from 'react'
import { fetchCandidateData, postPromise } from '~/shared/api/candidateApi'
import { useParams, useNavigate } from 'react-router-dom'
import TimezoneContext from './../contexts/TimezoneContext'

export default function CandidatePage() {

  const { fingerSessionId } = useParams()
  const navigate = useNavigate()
  const [candidateState, setCandidateState] = useState(null)
  const { tzMoment } = TimezoneContext.inject()
  useEffect(() => {
    if (!fingerSessionId) {
      navigate(`/error/${encodeURIComponent("id가 누락")}`)
      return
    }

    fetchCandidateData({ fingerSessionId }).then((candidateData) => {
      setCandidateState(candidateData)
    })

    return () => {
      setCandidateState(null)
    }
  }, [])

  const ACTIVE_DATE = useMemo(()=>{
    return {
      TODAY:tzMoment().format('YYYY-MM-DD'),
      TOMORROW:tzMoment().add(1, 'day').format('YYYY-MM-DD'),
    }
  }, [])

  const ACTIVE_TIME = useMemo(()=>{
    return {
      SOON:tzMoment().startOf('hour').add(1,'hour').format('HH:mm'),
    }
  }, [])

  const [ form , setForm ] = useState({
    title:"게임같이해요",
    description:"",
    startDate:ACTIVE_DATE.TODAY,
    startTime:ACTIVE_TIME.SOON,
  })

  const fromText = useMemo(()=>{
    return tzMoment(`${form.startDate} ${form.startTime}`, 'YYYY-MM-DD HH:mm').fromNow();
  }, [form])

  const validateMessage = useMemo(()=>{
    if(form.title.trim().length === 0){
      return "약속제목을 반드시 입력해 주세요"
    }
    const nowMoment = tzMoment()
    const setMoment = tzMoment(`${form.startDate} ${form.startTime}`, 'YYYY-MM-DD HH:mm')
    const diffHour = setMoment.diff(nowMoment, 'hour')
    const diffDay = setMoment.diff(nowMoment, 'days')

    if(diffHour < -2) {
      return "너무 옛날은 안됩니다. \"오늘\" \"곧\" 시간에 가깝게 입력해 주세요."
    }

    if(diffDay > 6) {
      return "너무 미래는 안됩니다. 가급적 일주일 이내로 입력해 주세요."
    }

  }, [form])

  function formAddTime (value, unit){
    const before = tzMoment(form.startTime, 'HH:mm')
    const after = tzMoment(form.startTime, 'HH:mm').add(value,unit)

    // 날짜 변경 감지를 위한 방법;
    const beforeDay = before.clone().startOf('day')
    const afterDay = after.clone().startOf('day')
    const incDay = afterDay.diff(beforeDay, 'days')

    setForm({
      ...form,
      startDate:tzMoment(form.startDate).add(incDay, 'day').format('YYYY-MM-DD'),
      startTime:tzMoment(form.startTime, 'HH:mm').add(value,unit).format('HH:mm'),
    })
  }
  
  async function handleSubmit (){
    postPromise({ fingerSessionId, data:form }).then(()=>{
      navigate(`/success/${encodeURIComponent(`약속을 개시했습니다`)}`)
    })
  }

  return (<main className="container">
    {
      !candidateState ? (
        <h2>잠시만 기다려주세요</h2>
      ) : (
        <div>
          <h2><img src={candidateState.starterAvatarUrl} className="circle" style={{ height: 48 }} />{candidateState.starterName}님의 약속잡기</h2>
          <p className="lead">
            아래에 약속 내용을 입력하세요
          </p>
          <hr/>
          <div>
            <div className="row mb-3 g-3 align-items-center">
              <div className="col-6 form-floating">
                <input type="email" className="form-control" id="floatingInput" placeholder="약속제목" value={form.title} onChange={({ target: { value:title }})=>{setForm({ ...form, title })}}/>
                <label htmlFor="floatingInput">약속제목</label>
              </div>
              <div className="col-auto">
                <span className="form-text">
                  제목은 필수 입니다
                </span>
              </div>
            </div>
            <div className="row mb-3 g-3 align-items-center">
               <div className="col-6 form-floating">
                <textarea type="email" className="form-control" id="floatingTextarea" placeholder="하고싶은 말이 있으면 남기세요" style={{ minHeight:80}}/>
                <label htmlFor="floatingTextarea">하고싶은 말이 있으면 남기세요</label>
              </div>
            </div>
            <div className="row mb-3 g-3 align-items-center">
              <div className="col-auto">
                <label className="col-form-label">시작날짜</label>
              </div>
              <div className="col-auto">
                <div className="btn-group" role="group" aria-label="Basic example">
                  <button type="button" className={['btn', form.startDate === ACTIVE_DATE.TODAY ? 'btn-primary' : 'btn-light'].join(' ')} onClick={()=>setForm({...form, startDate:ACTIVE_DATE.TODAY})}>오늘</button>
                  <button type="button" className={['btn', form.startDate === ACTIVE_DATE.TOMORROW ? 'btn-primary' : 'btn-light'].join(' ')} onClick={()=>setForm({...form, startDate:ACTIVE_DATE.TOMORROW})}>내일</button>
                </div>
              </div>
              {
                form.startDate && /\d\d\d\d-\d\d-\d\d/.test(form.startDate) && (
                  <div className="col-auto">
                    <input type="date" value={form.startDate} onChange={({ target:{ value:startDate } })=>setForm({...form, startDate })} />
                  </div>
                ) 
              }
            </div>
            <div className="row mb-3 g-3 align-items-center">
              <div className="col-auto">
                <label className="col-form-label">시작시간</label>
              </div>
              <div className="col-auto">
                <div className="btn-group" role="group" aria-label="Basic example">
                  <button 
                    type="button"
                    className={['btn', form.startDate === ACTIVE_DATE.TODAY && form.startTime === ACTIVE_TIME.SOON ? 'btn-primary' : 'btn-light'].join(' ')}
                    onClick={()=>setForm({...form, startTime:ACTIVE_TIME.SOON})}
                  >
                    곧
                  </button>
                </div>
              </div>
              <div className="col-auto finger-btn-group-mgs">
                <button type="button" className="btn btn-outline-secondary" onClick={()=>formAddTime(-30,'m')}>-30분</button>
                <button type="button" className="btn btn-outline-dark" onClick={()=>formAddTime(-1,'h')}>-1시간</button>
                <button type="button" className="btn btn-outline-primary" onClick={()=>formAddTime(1,'h')}>+1시간</button>
                <button type="button" className="btn btn-outline-info" onClick={()=>formAddTime(30,'m')}>+30분</button>
              </div>
              <div className="col-auto">
                <input type="time" value={form.startTime} onChange={({ target:{ value:startTime } })=>setForm({...form, startTime })} />
              </div>
            </div>
            <hr />
            {
              validateMessage ? (
                <div className="text-danger">
                  {validateMessage}
                </div>
              ) : (
                <div>
                  지금으로부터 {fromText} 시작합니다
                </div>
              )
            }
            <div style={{ marginTop:8 }}>
              <button type="button" className={["btn", validateMessage ? "btn-dark" : "btn-primary"].join(" ")} disabled={!!validateMessage} onClick={()=>{ handleSubmit() }}>등록하기</button>
            </div>
          </div>
        </div>
      )
    }
  </main>)

}
