import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login } from '@/api/index'
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  function increment() {
    count.value++
  }

  function doLogin() {
    return login
  }

  return { count, increment, doLogin }
})
