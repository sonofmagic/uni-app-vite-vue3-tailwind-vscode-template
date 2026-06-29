<script setup lang="ts">
const detailItems = [
  { label: '页面路径', value: 'package-basic/pages/detail/index' },
  { label: '样式入口', value: 'package-basic/pages/detail/index.css' },
  { label: '归属', value: '普通分包' },
]

onLoad(() => {
  console.log('普通分包详情页面加载')
})
</script>

<template>
  <view class="basic-detail-shell flex min-h-screen flex-col gap-5 px-5 py-6 text-slate-900">
    <view class="basic-detail-hero rounded-lg bg-white p-5 shadow-sm">
      <text class="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Basic detail
      </text>
      <view class="mt-3 text-2xl font-bold leading-tight">
        普通分包的第二个页面
      </view>
      <view class="mt-3 text-sm leading-6 text-slate-600">
        这个页面有自己的 CSS 入口，产物会落在普通分包详情页的 wxss 中。
      </view>
    </view>

    <view class="basic-detail-list rounded-lg bg-white p-4">
      <view
        v-for="item in detailItems"
        :key="item.label"
        class="basic-detail-list__item border-b border-emerald-100 py-3 last:border-b-0"
      >
        <view class="text-xs text-slate-500">
          {{ item.label }}
        </view>
        <view class="mt-1 text-sm font-semibold text-slate-950">
          {{ item.value }}
        </view>
      </view>
    </view>

    <navigator
      class="rounded-sm bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white"
      open-type="navigateBack"
    >
      返回上一页
    </navigator>
  </view>
</template>

<style src="./index.css"></style>
