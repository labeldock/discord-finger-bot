const Router = require("express")
const path = require('path')
const basePath = path.join(__dirname, '..', '..', 'db') 
const Datastore = require('nedb')
const { asArray, isPlainObject } = require('../utils/nodeFunction')

module.exports = serverState => {
  const router = Router();

  const usedJdbInsertPipes = {}
  const usedJdbUpdatePipes = {}
  const activeJdb = {}
  
  function useNEDBPipe(dbPath, defineHooks){
    const jdbFilePath = path.join(basePath, dbPath)

    const insertHooks = asArray(isPlainObject(defineHooks) ? defineHooks.insert : defineHooks).filter((hook)=>(typeof hook === "function")) 
    const updateHooks = asArray(isPlainObject(defineHooks) ? defineHooks.update : null).filter((hook)=>(typeof hook === "function"))
    
    if(insertHooks.length){
      if(!usedJdbInsertPipes[jdbFilePath]){
        usedJdbInsertPipes[jdbFilePath] = []
      }
      insertHooks.forEach((defineFn)=>{
        usedJdbInsertPipes[jdbFilePath].push(defineFn)
      })
    }

    if(updateHooks.length){
      if(!usedJdbUpdatePipes[jdbFilePath]){
        usedJdbUpdatePipes[jdbFilePath] = []
      }
      updateHooks.forEach((defineFn)=>{
        usedJdbUpdatePipes[jdbFilePath].push(defineFn)
      })
    }

    return exportsFunctions
  }

  function useNEDB(dbPath){
    const jdbFilePath = path.join(basePath, dbPath)

    if(activeJdb[jdbFilePath]){
      return activeJdb[jdbFilePath]
    }

    const db = new Datastore({ filename:jdbFilePath, autoload: true })

    function defineInsertDatum (datum){
      if(!usedJdbInsertPipes[jdbFilePath]){
        usedJdbInsertPipes[jdbFilePath] = []
      }

      const pipes = [
        (datum={})=>{
          if(!datum.create_at){
            datum.created_at = Date.now()
          }
          if(!datum.updated_at){
            datum.updated_at = Date.now()
          }
          return datum
        },
        ...usedJdbInsertPipes[jdbFilePath]
      ]

      return pipes.reduce((dest, pipe)=>pipe(dest), datum)
    }

    function defineUpdateDatum (datum){
      if(!usedJdbUpdatePipes[jdbFilePath]){
        usedJdbUpdatePipes[jdbFilePath] = []
      }

      const pipes = [
        (datum={})=>{
          datum.updated_at = Date.now()
          return datum
        },
        ...usedJdbUpdatePipes[jdbFilePath]
      ]

      return pipes.reduce((dest, pipe)=>pipe(dest), datum)
    }

    function defineInsertData (maybeData){
      return asArray(maybeData).map(defineInsertDatum)
    }

    function defineUpdateData (maybeData){
      return asArray(maybeData).map(defineInsertDatum)
    }

    function insert(data) {
      return new Promise((resolve, reject)=>{
        db.insert(defineInsertData(data), (error, news)=>{
          error ? reject(error) : resolve(news)
        })
      })
    }

    function find(where) {
      return new Promise((resolve, reject)=>{
        db.find(where, (error, data)=>{
          error ? reject(error) : resolve(data)
        })
      })
    }
    
    function remove(where) {
      return new Promise((resolve, reject)=>{
        find(where).then((targets)=>{
          if(!targets.length){
            return resolve([])
          } else {
            db.remove(where, (error, count)=>{
              if(error){
                throw error
              }
              
              if(targets.length !== count){
                throw new Error(`Count errors! [${targets.length}] !== [${count}]`)
              }

              resolve(targets)
            })
          }
        })
        .catch(reject)
      })
    }

    function count(where={}) {
      return new Promise((resolve, reject)=>{
        db.count(where, (error, count)=>{
          error ? reject(error) : resolve(count)
        })
      })
    }

    function put(where, order, config={ multi:false, returnUpdatedDocs:true }) {
      const { _id, ...values } = order;
      return new Promise((resolve, reject)=>{
        db.update(where, defineUpdateDatum(values), config, (error, count, updatedDocs)=>{
          error ? reject(error) : resolve(updatedDocs)
        })
      })
    }    

    function putAll(where, order) {
      return put(where, order, { multi:true, returnUpdatedDocs:true })
    }

    function patch(where, order, config={ multi:false, returnUpdatedDocs:true }) {
      const { _id, ...values } = order;
      return new Promise((resolve, reject)=>{
        db.update(where, { $set:defineUpdateDatum(values) }, config, (error, count, updatedDocs)=>{
          error ? reject(error) : resolve(updatedDocs)
        })  
      })  
    }      

    function patchAll(where, order) {
      return patch(where, order, { multi:true, returnUpdatedDocs:true })
    }

    const exportsDBApis = { 
      filename:jdbFilePath,
      insert,
      find,
      remove,
      put,
      putAll,
      patch,
      patchAll,
      count,
      defineInsert:defineInsertDatum,
      defineUpdate:defineUpdateDatum,
      defineInserts:defineInsertData,
      defineUpdates:defineUpdateData,
    }

    activeJdb[jdbFilePath] = exportsDBApis
    return exportsDBApis
  }

  const exportsFunctions = {
    useNEDBPipe,
    useNEDB,
  }

  Object.assign(serverState, exportsFunctions)
  return router;
}
