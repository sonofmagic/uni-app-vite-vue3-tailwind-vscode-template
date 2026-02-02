import { defineHandler } from 'mokup'

type TodoItem = {
  id: number
  title: string
  done: boolean
  priority: 'low' | 'medium' | 'high'
}

export default defineHandler((): TodoItem[] => {
  return [
    { id: 1, title: 'Wire up mokup routes', done: true, priority: 'high' },
    { id: 2, title: 'Connect mock API in UI', done: false, priority: 'medium' },
    { id: 3, title: 'Review response payloads', done: false, priority: 'low' },
  ]
})
