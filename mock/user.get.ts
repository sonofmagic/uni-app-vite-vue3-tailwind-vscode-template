import { defineHandler } from 'mokup'

type UserProfile = {
  id: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  email: string
  lastLogin: string
}

export default defineHandler((): UserProfile => {
  return {
    id: 'u_1001',
    name: 'Demo User',
    role: 'admin',
    email: 'demo@mokup.local',
    lastLogin: new Date().toISOString(),
  }
})
