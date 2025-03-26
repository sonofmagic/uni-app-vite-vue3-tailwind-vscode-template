'use strict';

const common_vendor = require('../common/vendor.js');

const useCounterStore = common_vendor.defineStore("counter", () => {
  const count = common_vendor.ref(0);
  function increment() {
    count.value++;
  }
  return { count, increment };
});

exports.useCounterStore = useCounterStore;