<script setup lang="ts">
import CapabilityShowcase from '@/components/sections/CapabilityShowcase.vue'
import ExperienceLab from '@/components/sections/ExperienceLab.vue'
import GradientFeature from '@/components/sections/GradientFeature.vue'
import HeroShowcase from '@/components/sections/HeroShowcase.vue'
import IconGallery from '@/components/sections/IconGallery.vue'
import MacroShowcase from '@/components/sections/MacroShowcase.vue'

onLoad(() => {
  console.log('欢迎使用 wx / not-wx 变量示例模板')
})
</script>

<template>
  <view
    class="
      flex min-h-screen w-full justify-center
      bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-0 py-6
      text-slate-800
    "
  >
    <view
      class="
        flex w-full flex-col space-y-5 px-4
        sm:px-5
        md:w-[94vw] md:max-w-[960px]
      "
    >
      <view>
        <HeroShowcase />
      </view>
      <view>
        <CapabilityShowcase />
      </view>
      <view>
        <ExperienceLab />
      </view>
      <view>
        <IconGallery />
      </view>
      <view>
        <GradientFeature />
      </view>
      <view>
        <MacroShowcase />
      </view>
      <view class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <navigator
          class="
            rounded-sm bg-emerald-600 px-4 py-3 text-center text-sm font-semibold
            text-white shadow-sm
          "
          url="/package-basic/pages/home/index"
        >
          打开普通分包
        </navigator>
        <navigator
          class="
            rounded-sm bg-zinc-950 px-4 py-3 text-center text-sm font-semibold
            text-white shadow-sm
          "
          url="/package-isolated/pages/home/index"
        >
          打开独立分包
        </navigator>
      </view>
    </view>
  </view>
</template>
