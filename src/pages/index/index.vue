<template>
  <view class="content">
    <view
      class="bg-[url(https://pic1.zhimg.com/v2-3ee20468f54bbfefcd0027283b21aaa8_720w.jpg)] bg-[length:100%_100%] bg-no-repeat w-screen h-[41.54vw]"></view>

    <view
      class="after:content-['uni-app-vite-vue3-tailwind-vscode-template'] text-sky-400"></view>

    <view class="text-gray-900/50 mb-2 before:content-['当前系统主题:']">
      {{ themeRef }}
    </view>
    <view
      class="text-gray-900/75 mb-2 before:content-['让我们开始神奇的_*tailwindcss*_开发吧！']"></view>

    <view class="space-y-[20rpx] flex flex-col items-center">
      <view
        class="bg-[#010101] dark:bg-[#fefefe] h-16 w-16 rounded-[20rpx] text-white flex justify-center items-center after:content-['hover']"
        hover-class="bg-[gray] dark:bg-[#121212]  after:!content-['good!']"></view>
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
      <view>
        <button class="text-[#fff]" :class="buttonClass" @click="increment">
          click here to inc {{ count }}
        </button>
      </view>

      <view class="test">test</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from 'vue'
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'
const store = useCounterStore()
const { count } = storeToRefs(store)
const { increment } = store
const buttonColors = [
  'bg-[#000]',
  'bg-[#111]',
  'bg-[#222]',
  'bg-[#333]',
  'bg-[#444]',
  'bg-[#555]',
  'bg-[#666]',
  'bg-[#777]',
  'bg-[#888]',
  'bg-[#999]'
]
const title = ref('Hello')
const themeRef = ref(uni.getSystemInfoSync().theme)
const classArray = computed(() => [
  title.value ? 'bg-[#ff00ff]' : undefined,
  {
    'text-[#00ffff]': Boolean(title),
    "bg-[url('https://xxx.com/xx.webp')]": true,
    "bg-[url('https://yyyy.com/ccc.webp')]": true
  }
])
const buttonClass = computed(() => {
  return buttonColors[count.value % buttonColors.length]
})
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
