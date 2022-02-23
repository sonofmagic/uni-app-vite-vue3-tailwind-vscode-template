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
