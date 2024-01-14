<template>
  <view class="space-y-1.5 [&>view]:text-center">
    <view
      class="bg-[url(https://pic4.zhimg.com/80/v2-63755eaa318858e33445862d72581207.png)] bg-[length:100%_100%] bg-no-repeat aspect-[100/16.1]"></view>

    <view
      class="flex items-center justify-center text-gray-600/75"
      @click="copy('https://github.com/sonofmagic/weapp-tailwindcss')">
      <view class="i-mdi-github-circle text-[32px] mx-2 text-black"></view>
      <view class="text-[22px]">+</view>
      <view class="i-mdi-star text-[32px] mx-2 text-yellow-400"></view>
    </view>
    <view
      @click="copy('https://weapp-tw.icebreaker.top/')"
      class="bg-gradient-to-r from-green-400 to-sky-400 bg-clip-text font-extrabold text-2xl text-transparent underline">
      weapp-tw.icebreaker.top
    </view>
    <view class="text-xs text-gray-600/75">
      你可以在上方的官网上，找到大量的提效解决方案
    </view>

    <view
      class="mb-2 before:content-['现在，让我们开始神奇的_tailwindcss_开发之旅吧！'] before:text-sky-400 before:text-xs text-center"></view>
  </view>
</template>

<script setup>
function copy(data) {
  uni.setClipboardData({
    data
  })
}
</script>

<style lang="scss" scoped></style>
