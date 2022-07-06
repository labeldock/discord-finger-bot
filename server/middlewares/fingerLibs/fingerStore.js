const { promisedNedb } = require("../../utils/nedbHelper");
const path = require('path')
const dir = path.join(__dirname, '..', '..', '..', 'db')

//
const dbCandidateSession = promisedNedb({ dir, filename:"CandidateSession.json" })
const dbReservedSession = promisedNedb({ dir, filename:"ReservedSession.json" })
const dbUserState = promisedNedb({ dir, filename:"UserState.json" })

module.exports = {
  dbCandidateSession,
  dbReservedSession,
  dbUserState,
}
