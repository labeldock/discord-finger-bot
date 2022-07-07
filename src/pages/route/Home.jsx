import { useEffect } from 'react'

export default function Home() {

  useEffect(()=>{
    console.log('use effect')
  })
  
  return  (
    <div className="container">
      <h1>안녕하세요</h1>
      <p>아직 설명이 없습니다</p>
    </div>
  )
}
