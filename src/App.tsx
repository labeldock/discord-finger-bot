import './App.scss';
import { Link, Routes, Route, Switch } from 'react-router-dom'
import { routes } from '~/pages/route'
import CandidatePage from '~/pages/CandidatePage'
import ErrorPage from '~/pages/ErrorPage'
import { useIntervalEffect } from '~/shared/utils/react-hooks'
import TimezoneContext from '~/contexts/TimezoneContext';
import moment from 'moment'
import 'moment/locale/ko'
moment.locale('ko')


function App() {
  return (
    <>
      <TimezoneContext.Provider>
        <nav className="container">
          <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
            <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
              <span className="fs-4">FingerBot (약속잡기도우미)</span>
            </Link>
            <ul className="nav nav-pills">
              <li className="nav-item">
                <CurrentTime />
              </li>
            </ul>
          </header>
        </nav>
        <Routes>
          {routes.map(({ path, component: RouteComponent }) => {
            return (
              <Route key={path} path={path} element={<RouteComponent />}/>
            )
          })}
          <Route path="/candidate/:fingerSessionId" element={<CandidatePage />} />
          <Route path="/candidate" element={<CandidatePage />} />
          <Route path="/error/:message" element={<ErrorPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </TimezoneContext.Provider>
    </>
  );
}


function CurrentTime (){
  const { tzMoment } = TimezoneContext.inject()
  const currentTime = useIntervalEffect(()=>{
    return tzMoment().format('ll hh:mm:ss')
  }, 1000, true)
  return (
    <>시간 : {currentTime}</>
  )
}

export default App;