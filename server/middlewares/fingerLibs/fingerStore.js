const { promisedNedb } = require("../../utils/nedbHelper");
const path = require('path')
const dir = path.join(__dirname, '..', '..', '..', 'db')

//
const dbCandidateSession = promisedNedb({ dir, filename:"CandidateSession.json" })
const dbPromiseSession = promisedNedb({ dir, filename:"PromiseSession.json" })
const dbUserState = promisedNedb({ dir, filename:"UserState.json" })

module.exports = {
  dbCandidateSession,
  dbPromiseSession,
  dbUserState,
}
