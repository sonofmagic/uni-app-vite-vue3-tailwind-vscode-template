/* eslint-disable @typescript-eslint/no-var-requires */
const { WeappTailwindcssDisabled } = require('./platform')

const plugins = [require('tailwindcss')(), require('autoprefixer')()]

if (!WeappTailwindcssDisabled) {
  plugins.push(
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    })
  )
}
plugins.push(require('weapp-tailwindcss/css-macro/postcss'))

module.exports = {
  plugins
}
