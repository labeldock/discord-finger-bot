import { hostname } from '../../../env/config.json'
import { createFetchWorker } from './fetchWorker'
const baseURL = `${hostname}:${import.meta.env.VITE_WEB_PORT}`

export const base = createFetchWorker({ baseURL, type: 'base' })
export const fetch = createFetchWorker({ baseURL, type: 'api' })
export const request = createFetchWorker({ baseURL, type: 'http' })