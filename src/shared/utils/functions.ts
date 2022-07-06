// NaN 평가 함수 (it:any):boolean
export const isAbsoluteNaN = function(it: any): boolean {
  // eslint-disable-next-line no-self-compare
  return it !== it && typeof it === 'number'
}

// null이나 undefined를 확인하기 위한 함수
export const isNone = function(data: any): boolean {
  return isAbsoluteNaN(data) || data === undefined || data === null
}

// 순수 Array를 확인하기 위한 함수
export const isArray = function(data: any): boolean {
  return Array.isArray(data) || data instanceof Array
}

// 순수 Object를 확인하기 위한 함수
export const isPlainObject = function(data: any): boolean {
  return typeof data === 'object' && Boolean(data) && data.constructor === Object
}

// array이면 그대로 리턴 아니면 Array로 변경하여 리턴함
export const asArray = function(data: any, defaultArray?: any[]): any[] {
  if (isArray(data)) {
    return data
  }
  if (isNone(data)) {
    return isArray(defaultArray) ? [...(defaultArray as any[])] : isNone(defaultArray) ? [] : [defaultArray]
  }
  if (typeof data === 'object' && typeof data.toArray === 'function') {
    return data.toArray()
  }
  return [data]
}

export const asObject = function(data: any, fallback: (data:any)=>object): object {
  return isPlainObject(data) ? data : typeof fallback === "function" ? fallback(data) : {}
}

// Infinity number 평가 함수 (it:any):boolean
export const isInfinity = function(it: any): boolean {
  return it === Number.POSITIVE_INFINITY || it === Number.NEGATIVE_INFINITY
}

// 순수 숫자 평가 함수 (it:any):boolean
export const isNumber = function(it: any): boolean {
  return typeof it === 'number' && !isInfinity(it) && !isAbsoluteNaN(it)
}

// 숫자 혹은 숫자 문자
export const likeNumber = function(it: any): boolean {
  if (isNumber(it)) return true
  if (typeof it === 'string') return String(parseFloat(it)) === String(it)
  return false
}

// 숫자나 글자인지 평가하는 함수
export const isText = function(it: any): boolean {
  return typeof it === 'string' || isNumber(it)
}

// 클래스 인스턴스나 Object를 확인하기 위한 함수
export const isObject = function(it: any): boolean {
  return it !== null && typeof it === 'object'
}

// 클래스 인스턴스나 Object를 확인하기 위한 함수
export const isInstance = function(it: any): boolean {
  return isObject(it) && !isPlainObject(it)
}

// 새로운 array에 담아 리턴합니다.
export const toArray = function(data: any): any[] {
  return asArray(data).slice(0)
}

// get이나 set을 위해 path를 찾아냄
export const browse = (obj: object | undefined, path: string | string[] = []): any[] => {
  const pathString = Array.isArray(path) ? path.join('.') : path
  const keys = String.prototype.split.call(pathString, /[,[\].]+?/).filter(Boolean)
  const result: any[] = []
  keys.reduce((parent: any, key: string, depth: number) => {
    if (parent && typeof parent === 'object') {
      const value = parent[key]
      result.push({ parent, key, depth, value })
      return value
    } else {
      result.push({ parent, key, depth, value: undefined })
      return undefined
    }
  }, obj)
  return result
}

// lodash.set 과 같음
export const set = (obj: object | undefined, path: string, setValue: any): void => {
  const [result] = browse(obj, path).reverse()
  if (!result) return
  const { parent, key } = result
  if (parent && typeof parent === 'object') {
    parent[key] = setValue
  }
}

// lodash.get 과 같음
export const get = (obj: object | undefined, path: string | [string]): any => {
  const [result] = browse(obj, path).reverse()
  return result ? result.value : undefined
}

// array의 아이템을 찾고 안의 값을 표시합니다. find, get 이 자주있는 패턴인데 코드가 리더블하지 않아 따로 작성됨
export const findGet = function(data: any, findFn, getPath: string): any {
  return get(asArray(data).find(findFn), getPath)
}

// 대상 array에 직접 index에 해당하는 값을 삭제합니다.
export const removeIndex = function(data: any, index: number | number[]) {
  const asData = asArray(data)
  const valueIndexes = asArray(index).filter(indexValue => typeof indexValue === 'number')
  valueIndexes.forEach((removeIndex, offset) => {
    asData.splice(removeIndex - offset, 1)
  })
  return asData
}

// 대상 array에 직접 값을 넣습니다. array가 아니면 array로 자동 캐스팅 됩니다. Set 처럼 동작합니다.
export const addValue = function(data: any, value: any): any[] {
  const asData = asArray(data)
  !asData.includes(value) && asData.push(value)
  return asData
}

// 대상 array에 직접 삭제합니다. array가 아니면 array로 자동 캐스팅 됩니다.
export const removeValue = function(data: any, value: any): any[] {
  const asData = asArray(data)
  const valueIndexes = []
  asData.forEach(
    typeof value === 'function'
      ? (asValue, index) => value(asValue, index) === true && valueIndexes.push(index)
      : (asValue, index) => asValue === value && valueIndexes.push(index),
  )
  return removeIndex(asData, valueIndexes)
}

// 배열에 index 에 해당하는 위치를 제거하고 새배열로 반환합니다.
export const removedIndex = function(data: any, index: number | number[]) {
  return removeIndex(toArray(data), index)
}

// 새로운 배열에 새 값을 넣습니다. set처럼 동작합니다.
export const addedData = function(data: any, value: any) {
  return addValue(toArray(data), value)
}

// 새로운 배열에 삭제한 값을 포함합니다.
export const removedData = function(data: any, value: any) {
  return removeValue(toArray(data), value)
}

// currentValue값을 toggleArgs목록중 존재하면 목록 값중 다음값을 아니면 첫번째 값을 반환함
export const toggleValue = (toggleValues: any[], currentValue: any, step: number = 1): any => {
  return (
    (toggleValues = asArray(toggleValues)) &&
    toggleValues[(toggleValues.findIndex(val => val === currentValue) + step) % toggleValues.length]
  )
}
export const nextValue = (toggleValues: any[], currentValue: any, step: number = 1): any =>
  toggleValue(toggleValues, currentValue, 1 * step)

export const prevValue = (toggleValues: any[], currentValue: any, step: number = 1): any =>
  toggleValue(toggleValues, currentValue, -1 * step)

// 숫자의 크기를 제한함 ( numbers:number|Array, max:number, min:number )
// limitNumber(10,5); //5
// limitNumber([10,10],5) // [5, 5]
// limitNumber([0,1,2,3], 2, 1) // [1,1,2,2]
export const limitNumber = (function() {
  const limitOf = function(number, max, min) {
    if (typeof number == 'number') {
      if (isNaN(number) || number === Infinity) {
        return min
      }
      if (number < min) {
        return min
      }
      if (number > max) {
        return max
      }
    }
    return number
  }
  const limitNumber = function(...args) {
    let [numbers, max, min] = args
    if (args.length === 2 && Array.isArray(max)) {
      const polymophMinMaxParameter = max
      min = polymophMinMaxParameter[0]
      max = polymophMinMaxParameter[1]
    }
    if (typeof max !== 'number') {
      max = Number.POSITIVE_INFINITY
    }
    if (typeof min !== 'number') {
      if (min === null || isNaN(min)) {
        min = Number.NEGATIVE_INFINITY
      } else {
        min = 0
      }
    }
    if (Array.isArray(numbers)) {
      for (var d = numbers, i = 0, l = d.length; i < l; i++) {
        d[i] = limitOf(d[i], max, min)
      }
      return numbers
    } else {
      return limitOf(numbers, max, min)
    }
  }
  return limitNumber
})()

// Object를 Array.map과 같이 iteration 시킴 (object:Object, fn:Function):Object
export const hashMap = function(object, fn) {
  if (typeof object === 'object' && !isArray(object)) for (var k in object) object[k] = fn(object[k], k)
  else return fn(object, void 0)
  return object
}

// v값을 domain값에 준하여, range값으로 변경함 시킴 d3의 domain range와 같은 개념임
// (domain:number|Array, range:number|Array, vs:number|Array, nice:boolean, limit:number|Array):number|Array;
export const domainRangeValue = function(domain, range, vs, nice, limit) {
  return hashMap(vs, function(v, sel) {
    const $range = sel ? range[sel] : range
    const $domain = sel ? domain[sel] : domain
    if (!$range || !$domain) {
      return v
    }

    const dSize = $domain[1] - $domain[0]
    const sSize = $range[1] - $range[0]
    const dRatePre = v - $domain[0]
    const dRate = dRatePre === 0 ? 0 : dRatePre / dSize
    const calc = $range[0] + sSize * dRate
    const nicedValue = nice ? Math.floor(calc) : calc
    return limit
      ? $range[1] > $range[0]
        ? limitNumber(nicedValue, $range[1], $range[0])
        : limitNumber(nicedValue, $range[0], $range[1])
      : nicedValue
  })
}

export function isEmptyObject(object) {
  if (object === null) return true
  if (object === undefined) return true
  if (object.length > 0) return false
  if (object.length === 0) return true
  if (typeof object !== 'object') return true
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) return false
  }
  return true
}

export function spliced(array, start, deleteCount, ...items) {
  return [...array.slice(0, start), ...items, ...array.slice(start + deleteCount)]
}

export const turn = function(i, limit, ts, resultHook?) {
  if (i < 0) {
    let abs = Math.abs(i / ts)
    i = limit - (abs > limit ? abs % limit : abs)
  }
  ts = typeof ts === 'number' ? ts : 1
  const fixIndex = Math.floor(i / ts)
  const result = limit > fixIndex ? fixIndex : fixIndex % limit
  return typeof resultHook === 'function' ? resultHook(result, i, limit, ts) : result
}

// UUID v4 generator in JavaScript (RFC4122 compliant)
export const generateUUID = (pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') =>
  pattern.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 3) | 8 // eslint-disable-line no-mixed-operators
    return v.toString(16)
  })

export const laneWatch = function() {
  let listeners = []
  let params = []

  function emitValue(...newParams) {
    if (
      newParams.length !== params.length ||
      newParams.some((newValue, index) => {
        return newValue !== params[index]
      })
    ) {
      params = newParams
      listeners.forEach(fn => {
        fn(...newParams)
      })
    }
  }

  function watch(fn) {
    listeners.push(fn)
    return function unwatch() {
      listeners = listeners.filter(listener => listener !== fn)
    }
  }

  return Object.defineProperties(
    {},
    {
      listeners: {
        enumerable: true,
        get: () => [...listeners],
      },
      params: {
        enumerable: true,
        get: () => [...params],
      },
      emit: {
        enumerable: false,
        value: emitValue,
      },
      watch: {
        enumerable: false,
        value: watch,
      },
    },
  )
}

export const splitCaseString = (s, c = undefined) => {
  if (typeof c === 'string') return s.split(c)
  if (typeof s !== 'string') return String(s)
  s = s.replace(/^#/, '') /*kebab*/
  var k = s.split('-')
  if (k.length > 1) return k /*snake*/
  var _ = s.split('_')
  if (_.length > 1) return _ /*Cap*/
  return s
    .replace(/[A-Z][a-z]/g, function(s) {
      return '%@' + s
    })
    .replace(/^%@/, '')
    .split('%@')
}

export const toPascalCase = s => {
  var words = splitCaseString(s)
  for (var i = 0, l = words.length; i < l; i++)
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase()
  return words.join('')
}

export const toCamelCase = s => {
  var words = splitCaseString(s)
  for (var i = 1, l = words.length; i < l; i++)
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase()
  words[0] = words[0].toLowerCase()
  return words.join('')
}

export const toSnakeCase = s => {
  var words = splitCaseString(s)
  for (var i = 0, l = words.length; i < l; i++) words[i] = words[i].toLowerCase()
  return words.join('_')
}

export const toKebabCase = s => {
  var words = splitCaseString(s)
  for (var i = 0, l = words.length; i < l; i++) words[i] = words[i].toLowerCase()
  return words.join('-')
}

export const timescaleExp = function(exp: String | Number): Number {
  var scale = 0
  if (typeof exp === 'number') {
    return exp
  }
  if (typeof exp === 'string') {
    //
    exp = exp.replace(/\d+(Y|years|year)/, function(t) {
      t.replace(/\d+/, function(d) {
        scale += Number(d) * 31536000000
        return ''
      })
      return ''
    })
    exp = exp.replace(/\d+(M|months|month)/, function(t) {
      t.replace(/\d+/, function(d) {
        scale += Number(d) * 2678400000
        return ''
      })
      return ''
    })
    exp = exp.replace(/\d+(D|day|dates|date)/, function(t) {
      t.replace(/\d+/, function(d) {
        scale += Number(d) * 86400000
        return ''
      })
      return ''
    })
    exp = exp.replace(/\d+(h|hours|hour)/, function(t) {
      t.replace(/\d+/, function(d) {
        scale += Number(d) * 3600000
        return ''
      })
      return ''
    })
    exp = exp.replace(/\d+(ms|milliseconds|millisecond)/, function(t) {
      t.replace(/\d+/, function(d) {
        scale += Number(d) * 1
        return ''
      })
      return ''
    })
    exp = exp.replace(/\d+(m|minutes|minute)/, function(t) {
      t.replace(/\d+/, function(d) {
        scale += Number(d) * 60000
        return ''
      })
      return ''
    })
    exp = exp.replace(/\d+(s|seconds|second)/, function(t) {
      t.replace(/\d+/, function(d) {
        scale += Number(d) * 1000
        return ''
      })
      return ''
    })
  }
  return scale
}

// do expression을 못써서 대체 유틸리티 입니다.
export const doit = (fn: Function | any, args: Array<any> | any): Array<any> =>
  typeof fn === 'function' ? fn(...asArray(args)) : undefined
