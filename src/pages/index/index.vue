<template>
  <view class="content">
    <view>当前系统主题:{{ themeRef }}</view>
    <view class="bg-[#010101] dark:bg-[#fefefe] h-10 w-10" hover-class="bg-[#e1e1e1] dark:bg-[#121212]"></view>
    <image class="logo" src="/static/logo.png" />
    <view class="text-area bg-[#123456]">
      <text class="title">{{ title }}</text>
    </view>
    <view class="text-[27rpx] border-[10rpx] border-[#faf]">text-[27rpx] border-[10rpx] border-[#111]</view>
    <view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 可不能这么写 -m-[20px]</view>
    <view class="space-y-[1.6rem]">
      <view class="max-w-[300px] min-h-[100px] text-[#dddddd]">max-w-[300px] min-h-[100px] text-[#dddddd]</view>
      <view class="
          flex
          items-center
          justify-center
          h-[100px]
          w-[100px]
          rounded-[40px]
          bg-[#123456] bg-opacity-[0.54]
          text-[#ffffff]
        ">Hello</view>
      <view class="
          border-[10px] border-[#098765] border-solid border-opacity-[0.44]
        ">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view>
      <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </view>
      <view class="
          w-32
          py-2
          rounded-md
          font-semibold
          text-white
          bg-pink-500
          ring-4 ring-pink-300
        ">
        Default
      </view>
    </view>
    <view class="test">test</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
const title = ref("Hello");
const themeRef = ref(uni.getSystemInfoSync().theme);
// #ifdef MP
uni.onThemeChange(({ theme }: { theme: "dark" | "light" }) => {
  themeRef.value = theme;
});
// #endif
onBeforeUnmount(() => {
  // #ifdef MP
  uni.offThemeChange(() => { });
  // #endif
});
</script>

<style lang="scss" scoped>
.logo {
  @apply h-[100rpx] w-[100rpx];
}

.test {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}
</style>
