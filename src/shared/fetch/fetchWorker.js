import axios from 'axios'
import Qs from 'qs'

//type [api, http]
// api : 바디의 내용만 추려 반환됨 (destructuring 을 최대한 단순하게 사용하기 위해)
// http : 헤더와 바디의 내용이 모두 반환됨 (response 헤더의 내용을 확인하고자 할때 사용)
export const createFetchWorker = ({ type = 'api', baseURL = undefined }) => {
  const defaultFetchWorker = axios.create({
    baseURL,
    method: 'get',
    paramsSerializer: params => Qs.stringify(params, { arrayFormat: 'repeat' }),
    withCredentials: true,
  })

  let responseHook

  switch (type) {
    case 'base':
    case 'http':
      responseHook = pass => pass
      break
    case 'api':
    default:
      responseHook = response => response.data
      break
  }

  defaultFetchWorker.interceptors.response.use(responseHook, error => {
    return Promise.reject(error)
  })

  // 헤더 변조가 필요할 경우 예시
  //defaultFetchWorker.interceptors.request.use((request)=>{
  //  if(request.method === "delete" && request.data){
  //    request.method = "post";
  //    request.headers = Object.assign(request.headers,{ "X-HTTP-Method-Override": "DELETE" });
  //  }
  //  return request;
  //});

  return defaultFetchWorker
}
