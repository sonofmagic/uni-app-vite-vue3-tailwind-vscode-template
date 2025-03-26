'use strict';

const common_vendor = require('../common/vendor.js');

const _sfc_main = {
  __name: 'WeappTailwindcss',
  setup(__props) {

function copy(data) {
  common_vendor.index.setClipboardData({
    data,
  });
}

return (_ctx, _cache) => {
  return {
  a: common_vendor.o($event => copy('https://github.com/sonofmagic/weapp-tailwindcss')),
  b: common_vendor.o($event => copy('https://tw.icebreaker.top/'))
}
}
}

};

wx.createComponent(_sfc_main);