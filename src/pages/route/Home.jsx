import { useEffect } from 'react'

export default function Home() {

  useEffect(()=>{
    console.log('use effect')
  })
  
  return <h1 className="container">Home</h1>
}
