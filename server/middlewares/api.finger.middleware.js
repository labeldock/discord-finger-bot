const Router = require("express")
const { 
  dbCandidateSession,
} = require("./fingerLibs/fingerStore")

module.exports = async serverState => {
  const router = Router();

  router.get("/api/discord/time", (req, res)=>{
    const timestamp = Date.now() + serverState.discordTimeOffest || Date.now()
    return res.status(200).send({ timestamp })
  })

  router.get("/api/candidate/:fingerSessionId", (req, res)=>{
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

  return router;
}