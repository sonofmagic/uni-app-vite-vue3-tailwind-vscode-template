<script setup lang="ts">
const metricCards = [
  { label: '分包类型', value: '普通分包' },
  { label: '样式入口', value: 'package-basic/pages/home/index.css' },
]

onLoad(() => {
  console.log('普通分包页面加载')
})
</script>

<template>
  <view
    class="
      basic-package-shell flex min-h-screen flex-col gap-5 px-5 py-6
      text-slate-900
    "
  >
    <view class="basic-nesting-demo rounded-lg bg-white/90 p-5 shadow-sm">
      <text class="basic-nesting-demo__eyebrow text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Basic subpackage
      </text>
      <view class="basic-nesting-demo__title mt-3 text-2xl font-bold leading-tight">
        普通分包保留自己的 Tailwind 与页面样式
      </view>
      <view class="basic-nesting-demo__body mt-3 text-sm leading-6 text-slate-600">
        这里的工具类由普通分包自己的 Tailwind 入口生成，主包入口不会扫描这个目录。
      </view>
    </view>

    <view class="basic-nesting-list grid grid-cols-1 gap-3">
      <view
        v-for="card in metricCards"
        :key="card.label"
        class="basic-nesting-list__item basic-package-card rounded-lg bg-white p-4"
      >
        <view class="text-xs text-slate-500">
          {{ card.label }}
        </view>
        <view class="mt-2 text-lg font-semibold text-slate-950">
          {{ card.value }}
        </view>
      </view>
    </view>

    <navigator
      class="rounded-sm bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-700 shadow-sm"
      url="/package-basic/pages/detail/index"
    >
      打开普通分包详情
    </navigator>

    <navigator
      class="rounded-sm bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white"
      open-type="navigateBack"
    >
      返回主包
    </navigator>
  </view>
</template>

<style src="./index.css"></style>
