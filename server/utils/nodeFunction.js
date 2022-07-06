// NaN 평가 함수 (it:any):boolean
function isAbsoluteNaN (it) {
  // eslint-disable-next-line no-self-compare
  return it !== it && typeof it === 'number';
};
// null이나 undefined를 확인하기 위한 함수
function isNone (data) {
  return isAbsoluteNaN(data) || data === undefined || data === null;
};
// 순수 Array를 확인하기 위한 함수
function isArray (data) {
  return Array.isArray(data) || data instanceof Array;
};
// array이면 그대로 리턴 아니면 Array로 변경하여 리턴함
function asArray (data, defaultArray) {
  if (isArray(data)) {
      return data;
  }
  if (isNone(data)) {
      return isArray(defaultArray) ? [...defaultArray] : isNone(defaultArray) ? [] : [defaultArray];
  }
  if (typeof data === 'object' && typeof data.toArray === 'function') {
      return data.toArray();
  }
  return [data];
};
// 순수 Object를 확인하기 위한 함수
function isPlainObject (data) {
  return typeof data === 'object' && Boolean(data) && data.constructor === Object;
};
// Infinity number 평가 함수 (it:any):boolean
function isInfinity (it) {
  return it === Number.POSITIVE_INFINITY || it === Number.NEGATIVE_INFINITY;
};
// 순수 숫자 평가 함수 (it:any):boolean
function isNumber (it) {
  return typeof it === 'number' && !isInfinity(it) && !isAbsoluteNaN(it);
};
// 숫자 혹은 숫자 문자
function likeNumber (it) {
  if (isNumber(it))
      return true;
  if (typeof it === 'string')
      return String(parseFloat(it)) === String(it);
  return false;
};
// 숫자나 글자인지 평가하는 함수
function isText (it) {
  return typeof it === 'string' || isNumber(it);
};
// 클래스 인스턴스나 Object를 확인하기 위한 함수
function isObject (it) {
  return it !== null && typeof it === 'object';
};
// 클래스 인스턴스나 Object를 확인하기 위한 함수
function isInstance (it) {
  return isObject(it) && !isPlainObject(it);
};
// 새로운 array에 담아 리턴합니다.
function toArray (data) {
  return asArray(data).slice(0);
};
// get이나 set을 위해 path를 찾아냄
function browse (obj, path) {
  const pathString = Array.isArray(path) ? path.join('.') : path;
  const keys = String.prototype.split.call(pathString, /[,[\].]+?/).filter(Boolean);
  const result = [];
  keys.reduce((parent, key, depth) => {
      if (parent && typeof parent === 'object') {
          const value = parent[key];
          result.push({ parent, key, depth, value });
          return value;
      }
      else {
          result.push({ parent, key, depth, value: undefined });
          return undefined;
      }
  }, obj);
  return result;
};
// lodash.set 과 같음
function set (obj, path, setValue) {
  const [result] = browse(obj, path).reverse();
  if (!result)
      return;
  const { parent, key } = result;
  if (parent && typeof parent === 'object') {
      parent[key] = setValue;
  }
};
// lodash.get 과 같음
function get (obj, path) {
  const [result] = browse(obj, path).reverse();
  return result ? result.value : undefined;
};
// array의 아이템을 찾고 안의 값을 표시합니다. find, get 이 자주있는 패턴인데 코드가 리더블하지 않아 따로 작성됨
function findGet (data, findFn, getPath) {
  return get(asArray(data).find(findFn), getPath);
};
// 대상 array에 직접 index에 해당하는 값을 삭제합니다.
function removeIndex (data, index) {
  const asData = asArray(data);
  const valueIndexes = asArray(index).filter(indexValue => typeof indexValue === 'number');
  valueIndexes.forEach((removeIndex, offset) => {
      asData.splice(removeIndex - offset, 1);
  });
  return asData;
};
// 대상 array에 직접 값을 넣습니다. array가 아니면 array로 자동 캐스팅 됩니다. Set 처럼 동작합니다.
function addValue (data, value) {
  const asData = asArray(data);
  !asData.includes(value) && asData.push(value);
  return asData;
};
// 대상 array에 직접 삭제합니다. array가 아니면 array로 자동 캐스팅 됩니다.
function removeValue (data, value) {
  const asData = asArray(data);
  const valueIndexes = [];
  asData.forEach(typeof value === 'function'
      ? (asValue, index) => value(asValue, index) === true && valueIndexes.push(index)
      : (asValue, index) => asValue === value && valueIndexes.push(index));
  return removeIndex(asData, valueIndexes);
};
// 배열에 index 에 해당하는 위치를 제거하고 새배열로 반환합니다.
function removedIndex (data, index) {
  return removeIndex(toArray(data), index);
};

function generateUUID (pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'){
  return pattern.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 3) | 8 // eslint-disable-line no-mixed-operators
    return v.toString(16)
  }) 
}

function encode64 (plainText=""){
  return Buffer.from(plainText).toString('base64')
}

function decode64 (encodedText=""){
  return Buffer.from(encodedText, 'base64').toString()
}

function deferral() {
  var resolve, reject
  var promise = new Promise(function() {
    resolve = arguments[0]
    reject = arguments[1]
  })
  return {
    resolve: resolve,
    reject: reject,
    promise: promise,
  }
}

function deferralReference (value){
  const { resolve:bootResolve, reject:bootReject, promise: boot } = deferral()
  let deferralEvents = {fullfill:[]};
  let fullfillDeferral = false;

  function resolve (value){
    if(fullfillDeferral === true) return
    deferralEvents.fullfill
    fullfillDeferral = true
    deferralEvents.fullfill.forEach((fn)=>fn());
    deferralEvents = null;
    bootResolve(value)
  }

  function reject (error){
    if(fullfillDeferral === true) return
    fullfillDeferral = true
    deferralEvents.fullfill.forEach((fn)=>fn());
    deferralEvents = null;
    bootReject(error)
  }

  const promise = new Promise((resolve, reject) => {
    boot.then((deferralResult) => {
      resolve(deferralResult)
    }).catch(reject)
  })

  async function finish (fn){
    let result = deferralObject.value;
    if(typeof fn === "function"){
      try {
        result = await fn(result)
      } catch(error){
        reject(error)
      }
    }
    resolve(result)
    return boot
  }

  function use (fn){
    function onBeforeFullfill (fn){
      typeof fn === "function" && deferralEvents.fullfill.push(fn)
    }
    if(typeof fn === "function"){
      try {
        fn({ onBeforeFullfill, finish, resolve, reject })
      } catch(error){
        reject(error)
      }
    }
    return deferralObject
  }

  const deferralObject = {
    resolve,
    reject,
    promise,
    value,
    finish,
    use,
  }

  return deferralObject
}

function parseMessagePayload (msg){
  try {
    return JSON.parse(msg)
  } catch(error){
    return {
      action:"unknown",
      data:msg
    }
  }
}
  

module.exports = {
  isAbsoluteNaN,
  isNone,
  isArray,
  asArray,
  isPlainObject,
  isInfinity,
  isNumber,
  likeNumber,
  isText,
  isObject,
  isInstance,
  toArray,
  browse,
  set,
  get,
  findGet,
  removeIndex,
  addValue,
  removeValue,
  removedIndex,
  generateUUID,
  encode64,
  decode64,
  deferral,
  deferralReference,
  parseMessagePayload,
}
