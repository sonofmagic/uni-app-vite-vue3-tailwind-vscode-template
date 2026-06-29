<script setup lang="ts">
const capabilities = ['independent: true', '本地 Tailwind 入口', '本地 CSS']

onLoad(() => {
  console.log('独立分包页面加载')
})
</script>

<template>
  <view
    class="
      isolated-package-shell flex min-h-screen flex-col gap-5 px-5 py-6
      text-zinc-950
    "
  >
    <view class="isolated-nesting-demo rounded-lg bg-white p-5 shadow-sm">
      <text class="isolated-nesting-demo__eyebrow text-xs font-semibold uppercase tracking-wide text-amber-700">
        Independent subpackage
      </text>
      <view class="isolated-nesting-demo__title mt-3 text-2xl font-bold leading-tight">
        独立分包携带自己的样式
      </view>
      <view class="isolated-nesting-demo__body mt-3 text-sm leading-6 text-zinc-600">
        独立分包不依赖主包样式，页面样式和 Tailwind 工具类都从分包入口生成。
      </view>
    </view>

    <view class="isolated-nesting-list isolated-package-panel rounded-lg bg-white p-4">
      <view
        v-for="item in capabilities"
        :key="item"
        class="isolated-nesting-list__item border-b border-zinc-100 py-3 text-sm font-medium last:border-b-0"
      >
        {{ item }}
      </view>
    </view>

    <navigator
      class="rounded-sm bg-white px-4 py-3 text-center text-sm font-semibold text-amber-700 shadow-sm"
      url="/package-isolated/pages/detail/index"
    >
      打开独立分包详情
    </navigator>

    <navigator
      class="rounded-sm bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-white"
      open-type="navigateBack"
    >
      返回主包
    </navigator>
  </view>
</template>

<style src="./index.css"></style>
