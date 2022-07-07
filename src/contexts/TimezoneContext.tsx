import { createContext, useState, useEffect, useCallback } from 'react'
import { exportContextProvider } from '../shared/utils/react-helpers'
import { fetchDiscordTime } from '~/shared/api/candidateApi'
import moment from 'moment'


const Context = createContext({ 
  tzTimestamp:Date.now(),
  tzMoment:(...args)=>moment(...args)
})

const Provider = ({ children }) => {
  const [ tzTimestamp, setTzTimestamp ] = useState(Date.now())
  const [ tzTimeOffset, setTzTimeOffset ] = useState(0)

  useEffect(()=>{
    fetchDiscordTime().then(({ timestamp })=>{
      const timeOffset = Date.now() - moment(timestamp).valueOf()
      setTzTimestamp(timestamp)
      setTzTimeOffset(timeOffset)
    })
  }, [])

  const tzMoment = useCallback((...args)=>{
    if(args.length === 0){
      return moment().add(tzTimeOffset, 'milliseconds')
    } else {
      return moment(...args)
    }
  }, [tzTimeOffset])

  return (
    <Context.Provider
      value={{
        tzTimestamp,
        tzMoment,
      }}>
      {children}
    </Context.Provider>
  )
}

export default exportContextProvider({ Context, Provider })
