import { http } from './request'

export function login() {
  return http.get('/')
}
