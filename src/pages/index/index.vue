<template>
  <view class="content">
    <image class="logo mt-6" src="/static/logo.png" />
    <button @click="increment">pinia {{ count }}</button>
    <view class="text-gray-900/50 my-4">当前系统主题:{{ themeRef }}</view>
    <view
      class="bg-[#010101] dark:bg-[#fefefe] h-10 w-10"
      hover-class="bg-[#e1e1e1] dark:bg-[#121212]"></view>
    <view class="text-area bg-[#123456]">
      <text class="title">{{ title }}</text>
    </view>
    <view class="text-[27rpx] border-[10rpx] border-[#faf]">
      text-[27rpx] border-[10rpx] border-[#111]
    </view>
    <view class="p-[20px] -mt-2 mb-[-20px]">
      p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]
    </view>
    <view class="space-y-[1.6rem]">
      <view class="max-w-[300px] min-h-[100px] text-[#dddddd]">
        max-w-[300px] min-h-[100px] text-[#dddddd]
      </view>
      <view
        class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">
        Hello
      </view>
      <view
        class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">
        border-[10px] border-[#098765] border-solid border-opacity-[0.44]
      </view>
      <view
        class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
        <div :class="classArray">1</div>
        <div>2</div>
        <div :class="classArray">3</div>
      </view>
      <view
        class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300">
        Default
      </view>
    </view>
    <view class="test">test</view>
    <input v-model="title" />
  </view>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from 'vue'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'
const store = useCounterStore()
const { count } = storeToRefs(store)
const { increment } = store

const title = ref('Hello')
const themeRef = ref(uni.getSystemInfoSync().theme)
const classArray = computed(() => [
  title.value ? 'bg-[#ff00ff]' : undefined,
  {
    'text-[#00ffff]': Boolean(title)
  }
])
// #ifdef MP
uni.onThemeChange(({ theme }: { theme: 'dark' | 'light' }) => {
  themeRef.value = theme
})
// #endif
onBeforeUnmount(() => {
  // #ifdef MP
  uni.offThemeChange(() => {
    console.log('offThemeChange')
  })
  // #endif
})
</script>

<style lang="scss" scoped>
.logo {
  @apply h-[100rpx] w-[100rpx];
}

.content {
  @apply flex flex-col items-center;
}

.test {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}
</style>
