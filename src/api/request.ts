import Request from 'luch-request'
import { useCounterStore } from '@/stores/counter'
const http = new Request()

http.interceptors.request.use(
  (config) => {
    const store = useCounterStore()
    console.log(store)
    return config
  },
  (config) => {
    return Promise.reject(config)
  }
)

export { http }
