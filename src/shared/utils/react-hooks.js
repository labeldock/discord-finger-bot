import { useState, useRef, useEffect } from 'react'

export function useIntervalEffect (intervalFn, interval, immediate = false){
  
  const [intervalTime, setIntervalTime] = useState(0) 
  const intervalTimeRef = useRef()
  const iternvalResultRef = useRef()
  intervalTimeRef.current = intervalTime

  useEffect(()=>{
    const intervalObject = setInterval(()=>{
      const currentTurn = intervalTimeRef.current + 1
      iternvalResultRef.current = intervalFn(currentTurn)
      setIntervalTime(currentTurn)
    }, interval)
    return ()=>{
      clearInterval(intervalObject)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  if(immediate === true){
    iternvalResultRef.current = intervalFn(0)
  }

  return iternvalResultRef.current
}
