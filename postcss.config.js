// 假如不起作用，请使用内联postcss，见 vite.config.ts
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-rem-to-responsive-pixel": {
      rootValue: 32,
      propList: ["*"],
      transformUnit: "rpx",
    },
    "weapp-tailwindcss-webpack-plugin/postcss": {},
  },
};
