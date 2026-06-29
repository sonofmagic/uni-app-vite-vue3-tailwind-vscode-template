<script setup lang="ts">
const detailItems = [
  { label: '页面路径', value: 'package-isolated/pages/detail/index' },
  { label: '样式入口', value: 'package-isolated/pages/detail/index.css' },
  { label: '归属', value: '独立分包' },
]

onLoad(() => {
  console.log('独立分包详情页面加载')
})
</script>

<template>
  <view class="isolated-detail-shell flex min-h-screen flex-col gap-5 px-5 py-6 text-zinc-950">
    <view class="isolated-detail-hero rounded-lg bg-white p-5 shadow-sm">
      <text class="text-xs font-semibold uppercase tracking-wide text-amber-700">
        Isolated detail
      </text>
      <view class="mt-3 text-2xl font-bold leading-tight">
        独立分包的第二个页面
      </view>
      <view class="mt-3 text-sm leading-6 text-zinc-600">
        这个页面同样拥有自己的 CSS 入口，不依赖主包样式扫描。
      </view>
    </view>

    <view class="isolated-detail-list rounded-lg bg-white p-4">
      <view
        v-for="item in detailItems"
        :key="item.label"
        class="isolated-detail-list__item border-b border-amber-100 py-3 last:border-b-0"
      >
        <view class="text-xs text-zinc-500">
          {{ item.label }}
        </view>
        <view class="mt-1 text-sm font-semibold text-zinc-950">
          {{ item.value }}
        </view>
      </view>
    </view>

    <navigator
      class="rounded-sm bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-white"
      open-type="navigateBack"
    >
      返回上一页
    </navigator>
  </view>
</template>

<style src="./index.css"></style>
