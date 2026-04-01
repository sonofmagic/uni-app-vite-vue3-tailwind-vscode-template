<script setup lang="ts">
const benefitTags = ['满额返券', '最高返1000京豆']
const extraTags = ['满额返券', '最高返1000京豆']

const serviceRows = [
  { icon: '自', text: '自营品质 心意直达', action: '一键送礼' },
  { icon: '配', text: '已选：16寸 M5 Max芯片，银色，18+40核/48G+2T，标准玻璃，1个', action: '可选服务' },
  { icon: '达', text: '今日达 12:00前付款，预计今天(04月02日)送达', action: '查看' },
  { icon: '补', text: '国家补贴 当前地区可领，本单可减1500元', action: '去领取' },
]

const actionItems = [
  { label: '店铺', icon: '店' },
  { label: '客服', icon: '客' },
  { label: '购物车', icon: '车', badge: '3' },
]
</script>

<template>
  <view class="min-h-screen bg-[#f6f6f6] text-[#1f1f1f]">
    <view
      class="
        bg-gradient-to-b from-[#efefef] via-[#f7f7f7] to-[#f6f6f6] px-3 pb-36
        pt-3
      "
    >
      <view class="mb-4 flex items-center justify-between">
        <view
          class="
            flex items-center rounded-full bg-white px-3 py-2
            shadow-[0_8rpx_24rpx_rgba(0,0,0,0.08)]
          "
        >
          <text class="px-2 text-lg font-semibold text-[#222]">‹</text>
          <text class="px-2 text-base text-[#444]">☰</text>
          <text class="px-2 text-base text-[#444]">⌕</text>
        </view>
        <view
          class="
            flex items-center rounded-full bg-white px-3 py-2
            shadow-[0_8rpx_24rpx_rgba(0,0,0,0.08)]
          "
        >
          <text class="px-2 text-base text-[#444]">⋯</text>
          <text class="px-2 text-base text-[#444]">◎</text>
        </view>
      </view>

      <view
        class="
          overflow-hidden rounded-[28rpx] bg-white pb-4
          shadow-[0_12rpx_36rpx_rgba(0,0,0,0.06)]
        "
      >
        <view class="px-4 pt-5">
          <view class="mb-6 flex items-center justify-center">
            <view
              class="
                relative h-[340rpx] w-full max-w-[560rpx] rounded-[24rpx]
                bg-black shadow-[0_16rpx_40rpx_rgba(0,0,0,0.18)]
              "
            >
              <view
                class="
                  absolute inset-x-4 top-4 h-[220rpx] rounded-[20rpx]
                  bg-gradient-to-br from-[#0b0b0f] via-[#24252b] to-[#080808]
                "
              />
              <view
                class="
                  absolute left-10 top-10 h-24 w-24 rounded-tl-[44rpx]
                  border-l-[14rpx] border-t-[14rpx] border-[#63646b]
                "
              />
              <view
                class="
                  absolute left-24 top-24 h-24 w-20 rounded-bl-[40rpx]
                  border-b-[14rpx] border-l-[14rpx] border-[#3b3c42]
                "
              />
              <view
                class="
                  absolute right-20 top-10 h-24 w-24 rounded-tr-[44rpx]
                  border-r-[14rpx] border-t-[14rpx] border-[#606168]
                "
              />
              <view
                class="
                  absolute right-10 top-28 h-24 w-20 rounded-bl-[40rpx]
                  border-b-[14rpx] border-l-[14rpx] border-[#424349]
                "
              />
              <view
                class="
                  absolute bottom-5 left-1/2 h-[14rpx] w-[420rpx]
                  -translate-x-1/2 rounded-full bg-[#c9c9cd]
                "
              />
              <view
                class="
                  absolute bottom-3 left-1/2 h-[10rpx] w-[500rpx]
                  -translate-x-1/2 rounded-full bg-[#9a9aa0]
                "
              />
              <view
                class="
                  absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2
                  -translate-y-1/2 items-center justify-center rounded-full
                  bg-white/20
                "
              >
                <text class="ml-1 text-lg text-white">▶</text>
              </view>
            </view>
          </view>

          <view class="mb-3 rounded-[24rpx] bg-[#18b84d] p-4 text-white">
            <view class="mb-2 flex items-end gap-2">
              <text class="text-[56rpx] font-bold leading-none">¥34499</text>
              <text class="pb-1 text-[22rpx] text-white/80">国补优惠后价</text>
            </view>
            <view class="mb-3 flex gap-2 text-center">
              <view
                class="
                  flex-1 rounded-[18rpx] bg-[#f4f5d6] px-2 py-3 text-[#1e7d26]
                "
              >
                <text class="block text-[40rpx] font-bold leading-none">1000</text>
                <text class="mt-1 block text-[22rpx]">以旧换新至高补贴</text>
              </view>
              <view
                class="flex-1 rounded-[18rpx] bg-[#168a3c] px-2 py-3 text-white"
              >
                <text class="block text-[40rpx] font-bold leading-none">12</text>
                <text class="mt-1 block text-[22rpx]">期免息</text>
              </view>
              <view
                class="flex-1 rounded-[18rpx] bg-[#0f8f37] px-2 py-3 text-white"
              >
                <text class="block text-[28rpx] font-semibold">国家补贴</text>
                <text class="mt-1 block text-[22rpx] text-white/80">省比 ¥1500</text>
              </view>
            </view>
            <view
              class="
                flex items-center justify-between rounded-[18rpx] bg-white/15
                px-3 py-2 text-[22rpx]
              "
            >
              <view class="flex items-center gap-2">
                <text
                  v-for="tag in benefitTags"
                  :key="tag"
                  class="rounded-full bg-white/20 px-2 py-1"
                >
                  {{ tag }}
                </text>
              </view>
              <text>›</text>
            </view>
          </view>

          <view
            class="
              mb-3 rounded-[24rpx] bg-white px-4 py-3
              shadow-[0_8rpx_22rpx_rgba(0,0,0,0.04)]
            "
          >
            <view class="mb-3 flex items-center justify-between text-[22rpx]">
              <view class="flex items-center gap-2">
                <text class="font-semibold text-[#333]">可再享：</text>
                <text
                  v-for="tag in extraTags"
                  :key="tag"
                  class="rounded-full bg-[#fff2f2] px-2 py-1 text-[#e4393c]"
                >
                  {{ tag }}
                </text>
              </view>
              <text class="text-[#b0b0b0]">›</text>
            </view>
            <view
              class="
                flex items-center gap-2 border-t border-dashed border-[#ececec]
                pt-3 text-[23rpx]
              "
            >
              <text class="font-semibold text-[#333]">开通享：</text>
              <text class="min-w-0 flex-1 text-[#555]">
                【官方补贴】+40微信券包已到账
              </text>
              <text class="text-[#e4393c]">›</text>
            </view>
          </view>

          <view class="mb-4 flex items-start gap-3">
            <view class="min-w-0 flex-1">
              <view class="mb-2 flex items-center gap-2">
                <text
                  class="
                    rounded bg-[#ff5630] px-2 py-1 text-[20rpx] font-semibold
                    text-white
                  "
                >
                  自营
                </text>
                <text
                  class="rounded bg-[#1f1f1f] px-2 py-1 text-[20rpx] text-white"
                >
                  新品
                </text>
              </view>
              <text
                class="text-[34rpx] font-semibold leading-[1.35] text-[#202020]"
              >
                Apple/苹果AI笔记本 MacBook Pro 16英寸 M5 Max 48G+2T
              </text>
              <text class="mt-2 block text-[22rpx] text-[#6e6e6e]">
                官方标配 16英寸 Liquid视网膜XDR显示屏
              </text>
            </view>
            <view
              class="
                flex w-[92rpx] flex-col items-center pt-1 text-[20rpx]
                text-[#555]
              "
            >
              <view
                class="
                  mb-1 flex h-[64rpx] w-[64rpx] items-center justify-center
                  rounded-full border border-[#e7e7e7] bg-white
                "
              >
                <text class="text-lg">♡</text>
              </view>
              <text>收藏</text>
            </view>
          </view>

          <view class="overflow-hidden rounded-[24rpx] bg-[#fafafa]">
            <view
              v-for="row in serviceRows"
              :key="row.text"
              class="
                flex items-center gap-3 border-b border-[#ececec] px-4 py-4
                last:border-b-0
              "
            >
              <view
                class="
                  flex h-[44rpx] w-[44rpx] items-center justify-center
                  rounded-full bg-[#fff1f1] text-[22rpx] font-semibold
                  text-[#e4393c]
                "
              >
                {{ row.icon }}
              </view>
              <text
                class="min-w-0 flex-1 text-[24rpx] leading-[1.4] text-[#333]"
              >
                {{ row.text }}
              </text>
              <text class="text-[22rpx] text-[#e4393c]">{{ row.action }} ›</text>
            </view>
          </view>

          <view
            class="
              mt-4 flex items-center justify-between rounded-[24rpx]
              bg-[#e8f8e8] px-4 py-3 text-[24rpx]
            "
          >
            <view class="flex items-center gap-2">
              <text class="font-semibold text-[#19a541]">国家补贴</text>
              <text class="text-[#4f704f]">当前地区可领，本单可减1500元</text>
            </view>
            <view
              class="
                rounded-full bg-[#19a541] px-3 py-1 text-[22rpx] font-semibold
                text-white
              "
            >
              去领取
            </view>
          </view>
        </view>
      </view>

      <view
        class="
          fixed bottom-[170rpx] right-3 flex h-[96rpx] w-[96rpx] flex-col
          items-center justify-center rounded-full bg-white
          shadow-[0_10rpx_30rpx_rgba(0,0,0,0.12)]
        "
      >
        <text class="text-[28rpx] text-[#7a7a7a]">咨</text>
        <text class="mt-1 text-[18rpx] text-[#7a7a7a]">咨询</text>
      </view>
    </view>

    <view
      class="
        fixed bottom-0 left-0 right-0 border-t border-[#ececec] bg-white px-3
        pb-5 pt-3
      "
    >
      <view class="flex items-center gap-3">
        <view class="flex flex-1 items-center justify-around">
          <view
            v-for="item in actionItems"
            :key="item.label"
            class="
              relative flex min-w-[80rpx] flex-col items-center text-[20rpx]
              text-[#444]
            "
          >
            <view
              class="
                mb-1 flex h-[54rpx] w-[54rpx] items-center justify-center
                rounded-full bg-[#f6f6f6] text-[24rpx]
              "
            >
              {{ item.icon }}
            </view>
            <text>{{ item.label }}</text>
            <view
              v-if="item.badge"
              class="
                absolute left-1/2 top-0 flex h-4 min-w-4 items-center
                justify-center rounded-full bg-[#ff5630] px-1 text-[18rpx]
                leading-none text-white
              "
            >
              {{ item.badge }}
            </view>
          </view>
        </view>
        <view
          class="
            flex h-[84rpx] flex-[1.6] overflow-hidden rounded-full text-[24rpx]
            font-semibold text-white
          "
        >
          <view class="flex flex-1 items-center justify-center bg-[#ff9d00]">
            <text>加入购物车</text>
          </view>
          <view
            class="
              flex flex-[1.35] flex-col items-center justify-center bg-[#ff3b30]
            "
          >
            <text>需领补贴购买</text>
            <text class="text-[18rpx] text-white/85">国补价约¥34499</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
