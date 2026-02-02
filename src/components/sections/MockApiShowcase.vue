<script setup lang="ts">
type UserProfile = {
  id: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  email: string
  lastLogin: string
}

type TodoItem = {
  id: number
  title: string
  done: boolean
  priority: 'low' | 'medium' | 'high'
}

type StatsSnapshot = {
  activeUsers: number
  conversionRate: number
  release: string
  serverTime: string
}

const loading = ref(false)
const error = ref<string | null>(null)
const user = ref<UserProfile | null>(null)
const todos = ref<TodoItem[]>([])
const stats = ref<StatsSnapshot | null>(null)
const lastUpdated = ref('')

const request = <T,>(url: string) => {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
          return
        }
        reject(new Error(`Request failed: ${res.statusCode}`))
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

const formatTimestamp = (value: Date) => {
  return value.toISOString().replace('T', ' ').slice(0, 19)
}

const priorityTone = (priority: TodoItem['priority']) => {
  if (priority === 'high') return 'text-rose-600'
  if (priority === 'medium') return 'text-amber-600'
  return 'text-emerald-600'
}

const refresh = async () => {
  loading.value = true
  error.value = null
  try {
    const [userData, todoData, statsData] = await Promise.all([
      request<UserProfile>('/api/user'),
      request<TodoItem[]>('/api/todos'),
      request<StatsSnapshot>('/api/stats'),
    ])
    user.value = userData
    todos.value = todoData
    stats.value = statsData
    lastUpdated.value = formatTimestamp(new Date())
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Request failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <view
    class="
      rounded-[32rpx] border border-slate-100/70 bg-white/80 p-5
      shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl
    "
  >
    <view class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <view>
        <view class="text-xs uppercase tracking-[6rpx] text-slate-400">
          Mock API
        </view>
        <view class="text-2xl font-semibold text-slate-800">
          Live Mock Data
        </view>
        <view class="mt-2 text-[26rpx] text-slate-500">
          Auto request on load, tap refresh to re-fetch /api/*.
        </view>
      </view>
      <view class="flex items-end gap-2">
        <view
          class="
            rounded-full border border-slate-200/80 bg-slate-900 px-4 py-2
            text-[24rpx] font-semibold text-white shadow-sm
          "
          hover-class="opacity-70"
          @click="refresh"
        >
          Refresh
        </view>
        <view v-if="lastUpdated" class="text-[22rpx] text-slate-400">
          Updated {{ lastUpdated }}
        </view>
      </view>
    </view>

    <view v-if="loading" class="mt-4 text-[26rpx] text-slate-400">
      Loading mock data...
    </view>
    <view v-else-if="error" class="mt-4 text-[26rpx] text-rose-500">
      {{ error }}
    </view>

    <view
      class="
        mt-4 grid gap-4
        md:grid-cols-3
      "
    >
      <view class="rounded-[24rpx] border border-slate-100 bg-slate-50/80 p-4">
        <view class="text-sm font-semibold text-slate-700">User</view>
        <view v-if="user" class="mt-2 space-y-1 text-[26rpx] text-slate-600">
          <view>ID: {{ user.id }}</view>
          <view>Name: {{ user.name }}</view>
          <view>Role: {{ user.role }}</view>
          <view class="truncate">Email: {{ user.email }}</view>
          <view class="text-[22rpx] text-slate-400">Last login: {{ user.lastLogin }}</view>
        </view>
        <view v-else class="mt-2 text-[26rpx] text-slate-400">
          No data yet.
        </view>
      </view>

      <view class="rounded-[24rpx] border border-slate-100 bg-slate-50/80 p-4">
        <view class="text-sm font-semibold text-slate-700">Stats</view>
        <view v-if="stats" class="mt-2 space-y-1 text-[26rpx] text-slate-600">
          <view>Active users: {{ stats.activeUsers }}</view>
          <view>Conversion: {{ stats.conversionRate }}</view>
          <view>Release: {{ stats.release }}</view>
          <view class="text-[22rpx] text-slate-400">Server: {{ stats.serverTime }}</view>
        </view>
        <view v-else class="mt-2 text-[26rpx] text-slate-400">
          No data yet.
        </view>
      </view>

      <view class="rounded-[24rpx] border border-slate-100 bg-slate-50/80 p-4">
        <view class="text-sm font-semibold text-slate-700">Todos</view>
        <view v-if="todos.length" class="mt-2 space-y-2 text-[26rpx] text-slate-600">
          <view
            v-for="item in todos"
            :key="item.id"
            class="flex items-center justify-between gap-2"
          >
            <view class="flex items-center gap-2">
              <view
                class="h-2 w-2 rounded-full"
                :class="item.done ? 'bg-emerald-500' : 'bg-slate-300'"
              />
              <view :class="item.done ? 'line-through text-slate-400' : ''">
                {{ item.title }}
              </view>
            </view>
            <view class="text-[22rpx]" :class="priorityTone(item.priority)">
              {{ item.priority }}
            </view>
          </view>
        </view>
        <view v-else class="mt-2 text-[26rpx] text-slate-400">
          No data yet.
        </view>
      </view>
    </view>
  </view>
</template>
