<template>
  <view
    class="pointer-events-none fixed z-50"
    :style="{
      top: padding[0] + 'rpx',
      right: padding[1] + 'rpx',
      bottom: padding[2] + 'rpx',
      left: padding[3] + 'rpx'
    }">
    <movable-area class="h-full w-full">
      <movable-view
        direction="all"
        @change="fabChange"
        @touchend="touchend"
        :x="positionRef.x"
        :y="positionRef.y"
        class="w-10 h-10">
        <view class="w-20 h-40 target-menu">
          <!-- <slot name="expand"> -->
          <view>
            <view>xxx</view>
            <view>yyy</view>
            <view>zzz</view>
            <view>aaa</view>
          </view>
          <!-- </slot> -->
        </view>

        <slot name="button">
          <view
            class="default-button bg-sky-400 rounded-full w-10 h-10 flex justify-center items-center pointer-events-auto"
            @click.stop="onClick">
            <slot>+</slot>
          </view>
        </slot>
      </movable-view>
    </movable-area>
  </view>
</template>

<script setup>
import { getRect } from '@/utils'
import debounce from 'lodash/debounce'
import { flip, offset, computePosition, autoPlacement } from '@floating-ui/core'
const vm = getCurrentInstance()
const systemInfo = uni.getSystemInfoSync()
const btnWidth = uni.upx2px(80)
const edgeWidth = uni.upx2px(32)

const props = defineProps({
  storeKey: {
    type: String,
    default: 'gfbtn'
  },
  padding: {
    type: Array,
    default: () => [64, 32, 64, 32]
  }
})

const positionRef = ref({
  x: 0,
  y: 0
})

function touchend() {
  console.log('touchend')

  setTimeout(() => {
    if (
      positionRef.value.x >
      (systemInfo.windowWidth - btnWidth - edgeWidth * 2) / 2
    ) {
      positionRef.value.x = systemInfo.windowWidth
    } else {
      positionRef.value.x = 0
    }
    if (props.storeKey) {
      setTimeout(() => {
        uni.setStorageSync(
          props.storeKey,
          JSON.stringify({
            x: positionRef.value.x,
            y: positionRef.value.y
          })
        )
      }, 0)
    }
  }, 200)
}

const emit = defineEmits(['click'])

function onClick() {
  emit('click')
}

function getElementRects({ reference, floating, strategy }) {
  return {
    reference: { width: 0, height: 0, x: 0, y: 0 },
    floating: { width: 0, height: 0, x: 0, y: 0 }
  }
}
const btn = ref()
onMounted(async () => {
  console.log(btn.value)
  const reference = await getRect(vm, '.default-button')
  console.log(reference)
  const floating = await getRect(vm, '.target-menu')
  console.log(floating)
  // const referenceEl = { width: 100, height: 100, x: 50, y: 50 }
  // const floatingEl = { width: 200, height: 200, x: 0, y: 0 }
  // const res = await computePosition(referenceEl, floatingEl, {
  //   platform: {},
  //   placement: 'left'
  // })
  // console.log(res)
})

const resetToYaxis = debounce(function (x, y, source) {
  if (source) {
    positionRef.value.x = x
    positionRef.value.y = y
  }

  // console.log('[Final]', x, y, source)
}, 100)

function fabChange(event) {
  if (event && event.detail) {
    const { x, y, source } = event.detail

    resetToYaxis(x, y, source)
  }
}
// 初始位置
if (systemInfo) {
  const { windowHeight, windowWidth } = systemInfo

  positionRef.value.x = windowWidth
  positionRef.value.y = windowHeight / 1.25
}

if (props.storeKey) {
  try {
    const p = uni.getStorageSync(props.storeKey)
    if (p) {
      Object.assign(positionRef.value, JSON.parse(p))
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style></style>
