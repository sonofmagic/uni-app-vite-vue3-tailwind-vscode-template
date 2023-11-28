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
        <view class="w-20 h-40 bg-sky-100 absolute left-0">
          <slot name="expand"></slot>
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
import debounce from 'lodash/debounce'
import { flip, offset, computePosition } from '@floating-ui/core'
const systemInfo = uni.getSystemInfoSync()
const btnWidth = uni.upx2px(80)
const edgeWidth = uni.upx2px(32)
const vm = getCurrentInstance()
function getRect(selector, all) {
  const method = all ? 'selectAll' : 'select'
  return new Promise((resolve) => {
    uni
      .createSelectorQuery()
      .in(vm)
      [method](selector)
      .boundingClientRect((rect) => {
        if (all && Array.isArray(rect) && rect.length) {
          resolve(rect)
        }
        if (!all && rect) {
          resolve(rect)
        }
      })
      .exec()
  })
}

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

onMounted(async () => {
  const res = await getRect('.default-button')
  console.log(res)
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
