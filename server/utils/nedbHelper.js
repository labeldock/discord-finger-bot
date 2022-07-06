const path = require('path')
const Datastore = require('nedb')
const { asArray, isPlainObject } = require('./nodeFunction')

let nedbBasePath = path.join(__dirname)

function setupDir (newPath){
  nedbBasePath = newPath
}

function promisedNedb({ dir = nedbBasePath, filename = 'default.json' } = {}) {
  const nedbFilePath = path.join(dir, filename)
  const browserInsertPipe = []
  const browserUpdatePipe = []
  const db = new Datastore({ filename:nedbFilePath, autoload: true })

  function defineInsertDatum(datum) {
    const pipes = [
      (datum = {}) => {
        if (!datum.create_at) {
          datum.created_at = Date.now()
        }
        if (!datum.updated_at) {
          datum.updated_at = Date.now()
        }
        return datum
      },
      ...browserInsertPipe,
    ]

    return pipes.reduce((dest, pipe) => pipe(dest), datum)
  }

  function defineUpdateDatum(datum) {
    const pipes = [
      (datum = {}) => {
        datum.updated_at = Date.now()
        return datum
      },
      ...browserUpdatePipe,
    ]

    return pipes.reduce((dest, pipe) => pipe(dest), datum)
  }

  function defineInsertData(maybeData) {
    return asArray(maybeData).map(defineInsertDatum)
  }

  function defineUpdateData(maybeData) {
    return asArray(maybeData).map(defineInsertDatum)
  }

  function insert(data) {
    return new Promise((resolve, reject) => {
      db.insert(defineInsertData(data), (error, news) => {
        error ? reject(error) : resolve(news)
      })
    })
  }

  function find(where, ...commands) {
    return new Promise((resolve, reject) => {
      const executable = db.find(where)

      commands.forEach(command => {
        if (!isPlainObject(command)) {
          if (typeof command === 'function') {
            command(executable)
          } else {
            console.log(
              "Only plainObject or function is supported as the second argument of the promisedNedb utility's find command",
            )
          }
          return
        }
        if (command.hasOwnProperty('sort')) {
          executable.sort(command.sort)
        }
        if (command.hasOwnProperty('skip')) {
          executable.skip(command.skip)
        }
        if (command.hasOwnProperty('limit')) {
          executable.limit(command.limit)
        }
        if (command.hasOwnProperty('projection')) {
          executable.projection(command.projection)
        }
      })
      
      executable.exec((error, data) => {
        error ? reject(error) : resolve(data)
      })
    })
  }

  function findOne(where, ...commands) {
    return find(where, ...[...commands, { limit: 1 }]).then(([data]) => data)
  }

  function remove(where, ...commands) {
    return new Promise((resolve, reject) => {
      find(where, ...commands)
        .then(targets => {
          if (!targets.length) {
            return resolve([])
          } else {
            const resolver = Promise.resolve()

            targets.forEach(target => {
              resolver.then(()=>{
                return new Promise((resolve)=>{
                  db.remove({ _id: target._id }, (error, count)=>{
                    if (error) {
                      throw error
                    }
                    resolve()
                  })
                })
              })
            })

            resolver.then(()=>{
              resolve(targets)
            })
          }
        })
        .catch(reject)
    })
  }

  function count(where = {}) {
    return new Promise((resolve, reject) => {
      db.count(where, (error, count) => {
        error ? reject(error) : resolve(count)
      })
    })
  }

  function put(where, order, config = { multi: false, returnUpdatedDocs: true }) {
    const { _id, ...values } = order
    return new Promise((resolve, reject) => {
      db.update(where, defineUpdateDatum(values), config, (error, count, updatedDocs) => {
        error ? reject(error) : resolve(updatedDocs)
      })
    })
  }

  function putAll(where, order) {
    return put(where, order, { multi: true, returnUpdatedDocs: true })
  }

  function patch(where, order, config = { multi: false, returnUpdatedDocs: true }) {
    const { _id, ...values } = order
    return new Promise((resolve, reject) => {
      db.update(where, { $set: defineUpdateDatum(values) }, config, (error, count, updatedDocs) => {
        error ? reject(error) : resolve(updatedDocs)
      })
    })
  }

  function patchAll(where, order) {
    return patch(where, order, { multi: true, returnUpdatedDocs: true })
  }

  const exportsDBApis = {
    filename,
    insert,
    find,
    findOne,
    remove,
    put,
    putAll,
    patch,
    patchAll,
    count,
    defineInsert: defineInsertDatum,
    defineUpdate: defineUpdateDatum,
    defineInserts: defineInsertData,
    defineUpdates: defineUpdateData,
    debug: {
      browserInsertPipe,
      browserUpdatePipe,
    },
  }

  return exportsDBApis
}

module.exports = {
  setupDir,
  promisedNedb
}