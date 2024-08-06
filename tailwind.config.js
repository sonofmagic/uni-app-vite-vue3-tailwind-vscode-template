const cssMacro = require('weapp-tailwindcss/css-macro')
const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')
const { isMp } = require('./platform')
/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // 你可以在这里进行颜色的扩展
        // primary: {
        //   'DEFAULT': 'var(--color-primary, #0089FF)',
        //   'light-3': 'var(--color-primary-light-3, rgb(85, 199, 255))',
        //   'light-5': 'var(--color-primary-light-5, rgb(130, 217, 255))',
        //   'light-7': 'var(--color-primary-light-7, rgb(175, 235, 255))',
        //   'light-9': 'var(--color-primary-light-9, rgb(219, 252, 255))',
        //   'dark-2': 'var(--color-primary-dark-2, rgb(0, 135, 204))',
        // },
      },

    },
  },
  // https://weapp-tw.icebreaker.top/docs/quick-start/uni-app-css-macro
  plugins: [
    cssMacro({
      variantsMap: {
        'wx': 'MP-WEIXIN',
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true,
        },
        // mv: {
        //   value: 'H5 || MP-WEIXIN'
        // },
        // '-mv': {
        //   value: 'H5 || MP-WEIXIN',
        //   negative: true
        // }
      },
    }),
    iconsPlugin({
      // Select the icon collections you want to use
      collections: getIconCollections(['svg-spinners', 'mdi']),
    }),
  ],
  corePlugins: {
    preflight: !isMp,
  },
}
