<script setup lang="ts">
type PageStatus = 'idle' | 'loading' | 'success' | 'error'

const pageStatus = ref<PageStatus>('idle')
</script>

<template>
  <view class="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6">
    <text class="text-3xl font-bold text-slate-900">Hello World</text>
    <text class="text-sm text-slate-500">status: {{ pageStatus }}</text>
  </view>
</template>
