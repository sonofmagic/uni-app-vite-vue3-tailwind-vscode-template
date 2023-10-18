<template>
  <view class="content">
    <WeappTailwindcss></WeappTailwindcss>
    <view class="mt-[13.14758px]"></view>
    <view class="text-gray-900/50 mb-2 before:content-['当前系统主题:']">
      {{ themeRef }}
    </view>
    <view class="space-y-[20rpx] flex flex-col items-center">
      <view
        class="bg-[#389f2bb1] h-16 w-16 rounded-[20rpx] text-white flex justify-center items-center after:content-['hover']"
        hover-class="!bg-[gray] after:!content-['good!']"></view>
      <view
        class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
        <div :class="classArray">1</div>
        <div>2</div>
        <div :class="classArray">3</div>
      </view>
      <view
        class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300 text-center">
        Default
      </view>
      <view>
        <button
          class="text-[#fff] w-64"
          :class="buttonClass"
          @click="increment">
          click here to inc {{ count }}
        </button>
      </view>

      <view class="test">@apply</view>
      <view>
        <view
          class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500">
          样式的条件编译:微信小程序为蓝色，不是微信小程序为红色
        </view>

        <view class="wx:bg-blue-500 -wx:bg-red-500">
          <view>自定义配置的方式进行样式条件编译</view>
          <view>相关配置见根目录下的tailwind.config.js</view>
        </view>

        <view class="apply-class-0">@apply 条件编译方式0</view>
        <view class="apply-class-1">@apply 条件编译方式1</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import WeappTailwindcss from '@/components/WeappTailwindcss.vue'
import { useCounterStore } from '@/stores/counter'

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
  'bg-[#999]',
  'bg-[#aaa]',
  'bg-[#bbb]',
  'bg-[#ccc]',
  'bg-[#ddd]',
  'bg-[#eee]',
  'bg-[#fff]'
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

onLoad(() => {
  console.log('欢迎使用uni-app-vite-vue3-tailwindcss模板')
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

.apply-class-0 {
  @apply ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500;
}

.apply-class-1 {
  // 这个需要在 tailwind.config.js 里进行自定义配置
  @apply wx:bg-blue-500 -wx:bg-red-500;
}
</style>
