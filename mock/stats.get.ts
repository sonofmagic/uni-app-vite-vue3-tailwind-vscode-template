import { defineHandler } from 'mokup'

type StatsSnapshot = {
  activeUsers: number
  conversionRate: number
  release: string
  serverTime: string
}

export default defineHandler((): StatsSnapshot => {
  const activeUsers = 320 + Math.floor(Math.random() * 80)
  const conversionRate = Number((0.18 + Math.random() * 0.08).toFixed(2))

  return {
    activeUsers,
    conversionRate,
    release: 'v1.0.0',
    serverTime: new Date().toISOString(),
  }
})
