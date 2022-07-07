const Router = require("express")
const { 
  dbCandidateSession,
} = require("./fingerLibs/fingerStore")

const { 
  handleCreatePromiseSession
} = require("./fingerLibs/handleSession")

module.exports = async serverState => {
  const router = Router();

  router.get("/api/discord/time", async (req, res)=>{
    const timestamp = Date.now() + serverState.discordTimeOffest || Date.now()
    return res.status(200).send({ timestamp })
  })

  router.get("/api/candidate/:fingerSessionId", async (req, res)=>{
    const { fingerSessionId } = req.params
    dbCandidateSession.find({ fingerSessionId }).then(([candidateSessionObject])=>{
      if(!candidateSessionObject){
        res.status(404)
        res.send('404 Not Found')
      } else {
        res.status(200)
        res.send(candidateSessionObject)
      }
    }).catch((error)=>{
      res.status(500).send(error.message);
    })
  })

  router.post("/api/candidate/:fingerSessionId/promise", async (req, res)=>{
    if(!serverState.discordClient){
      res.status(500)
      res.send({ message: 'no managed client' })
      return
    }
    
    const { fingerSessionId } = req.params
    const { title, description, startDate, startTime } = req.body
    const [ candiateSession ] = await dbCandidateSession.find({ fingerSessionId })
    
    if(!candiateSession){
      res.status(500)
      res.send({ message: 'no finger session' })
      return
    }

    try {
      await handleCreatePromiseSession({ 
        client:serverState.discordClient,
        candiateSession,
        promisePayload:{
          title,
          description,
          startDate,
          startTime
        },
      })
    } catch(error) {
      res.status(500)
      res.send({ message: error.message })
      return
    }

    res.status(200)
    res.send({ message: 'ok' })

  })

  return router;
}